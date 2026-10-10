import {
  readCivilizationServerSession
} from "@/lib/civilization-server-session";

import {
  CivilizationPersistenceUnavailableError,
  withCivilizationReadTransaction
} from "@/lib/city-local-db";

import {
  findCity,
  findCurrentActivePlacement,
  findDistrict,
  findFacility,
  findTerritory,
  hasNationReadAuthorization,
  listDistrictsForCity,
  listFacilitiesForCity,
  type CityRegistryRecord,
  type DistrictRegistryRecord,
  type TerritoryRecord
} from "@/lib/city-local-read-repository";

import {
  NextRequest,
  NextResponse
} from "next/server";

const PROJECTION_VERSION =
  "r13-city-local-read-v1";

type Readiness =
  | "active"
  | "partial_data"
  | "blocked";

type RouteReadiness = {
  readiness: Readiness;
  reasons: string[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function jsonResponse(
  payload: unknown,
  status = 200
): NextResponse {
  return NextResponse.json(
    payload,
    {
      status,
      headers: {
        "cache-control":
          "no-store"
      }
    }
  );
}

function errorResponse(
  status: number,
  error: string
): NextResponse {
  return jsonResponse(
    { error },
    status
  );
}

function actorKey(
  request: NextRequest
): string | null {
  const result =
    readCivilizationServerSession(
      request
    );

  if (
    result.status !== "ok"
  ) {
    return null;
  }

  return (
    result.session.civilizationId
  );
}

function validUuid(
  value: string
): boolean {
  return UUID_PATTERN.test(
    value
  );
}

function validCityCode(
  value: string
): boolean {
  return (
    value.length > 0 &&
    value.length <= 128 &&
    value.trim() === value &&
    !/[\u0000-\u001f\u007f]/.test(
      value
    )
  );
}

function uniqueReasons(
  reasons: string[]
): string[] {
  return Array.from(
    new Set(reasons)
  );
}

function cityRequiredReasons(
  city: CityRegistryRecord,
  territory: TerritoryRecord | null
): string[] {
  const reasons: string[] = [];

  if (!city.currentActive) {
    reasons.push(
      "city_not_current_active"
    );
  }

  if (!territory) {
    reasons.push(
      "territory_missing"
    );
  } else if (
    !territory.currentActive
  ) {
    reasons.push(
      "territory_not_current_active"
    );
  }

  return reasons;
}

function districtReadiness(
  district: DistrictRegistryRecord,
  city: CityRegistryRecord | null,
  territory: TerritoryRecord | null
): RouteReadiness {
  const required: string[] = [];
  const optional: string[] = [];

  if (!city) {
    required.push(
      "city_binding_unresolved"
    );
  } else if (
    !city.currentActive
  ) {
    required.push(
      "city_not_current_active"
    );
  }

  if (!territory) {
    required.push(
      "territory_binding_unresolved"
    );
  } else if (
    !territory.currentActive
  ) {
    required.push(
      "territory_not_current_active"
    );
  }

  if (
    district.districtStatus !==
    "active"
  ) {
    required.push(
      "district_not_active"
    );
  }

  if (!district.boundaryRef) {
    optional.push(
      "boundary_ref_missing"
    );
  }

  if (!district.zonePolicyRef) {
    optional.push(
      "zone_policy_ref_missing"
    );
  }

  if (required.length > 0) {
    return {
      readiness: "blocked",
      reasons: uniqueReasons([
        ...required,
        ...optional
      ])
    };
  }

  if (optional.length > 0) {
    return {
      readiness:
        "partial_data",
      reasons:
        uniqueReasons(optional)
    };
  }

  return {
    readiness: "active",
    reasons: []
  };
}

function districtProjection(
  district: DistrictRegistryRecord,
  route: RouteReadiness
) {
  return {
    district_id:
      district.districtRegistryId,
    district_registry_id:
      district.districtRegistryId,
    district_code:
      district.districtCode,
    district_name:
      district.districtName,
    district_status:
      district.districtStatus,
    district_structure_type:
      district.districtType,
    territory_code:
      district.territoryCode,
    boundary_ref:
      district.boundaryRef,
    zone_policy_ref:
      district.zonePolicyRef,
    route_readiness:
      route.readiness,
    route_readiness_reasons:
      route.reasons
  };
}

function cityProjection(
  city: CityRegistryRecord
) {
  return {
    city_code:
      city.cityCode,
    city_name:
      city.cityName,
    territory_code:
      city.territoryCode,
    city_status:
      city.cityStatus
  };
}

export async function readCityMapApi(
  request: NextRequest,
  nationId: string,
  cityCode: string
): Promise<NextResponse> {
  if (
    !validUuid(nationId) ||
    !validCityCode(cityCode)
  ) {
    return errorResponse(
      400,
      "invalid_request_identity"
    );
  }

  const sessionActorKey =
    actorKey(request);

  if (!sessionActorKey) {
    return errorResponse(
      401,
      "unauthenticated"
    );
  }

  try {
    const result =
      await withCivilizationReadTransaction(
        async (client) => {
          const allowed =
            await hasNationReadAuthorization(
              client,
              sessionActorKey,
              nationId
            );

          if (!allowed) {
            return {
              kind: "forbidden"
            } as const;
          }

          const city =
            await findCity(
              client,
              nationId,
              cityCode
            );

          if (!city) {
            return {
              kind: "not_found"
            } as const;
          }

          const [
            territory,
            districts,
            facilities
          ] = await Promise.all([
            findTerritory(
              client,
              city.nationId,
              city.territoryCode
            ),
            listDistrictsForCity(
              client,
              city.nationId,
              city.cityCode
            ),
            listFacilitiesForCity(
              client,
              city.nationId,
              city.cityCode
            )
          ]);

          const requiredReasons =
            cityRequiredReasons(
              city,
              territory
            );

          const districtItems =
            districts.map(
              (district) => {
                const route =
                  districtReadiness(
                    district,
                    city,
                    territory
                  );

                return districtProjection(
                  district,
                  route
                );
              }
            );

          const facilityItems =
            facilities.map(
              (facility) => {
                const reasons = [
                  "facility_type_unresolved",
                  "canonical_ui_target_unresolved"
                ];

                if (
                  facility.facilityStatus !==
                  "active"
                ) {
                  reasons.push(
                    "facility_not_active"
                  );
                }

                if (
                  !city.currentActive
                ) {
                  reasons.push(
                    "city_not_current_active"
                  );
                }

                if (
                  !territory
                ) {
                  reasons.push(
                    "territory_binding_unresolved"
                  );
                } else if (
                  !territory.currentActive
                ) {
                  reasons.push(
                    "territory_not_current_active"
                  );
                }

                return {
                  facility_id:
                    facility.facilityRegistryId,
                  facility_registry_id:
                    facility.facilityRegistryId,
                  facility_type:
                    null,
                  facility_name:
                    facility.facilityName,
                  facility_status:
                    facility.facilityStatus,
                  canonical_ui_target:
                    null,
                  territory_code:
                    facility.territoryCode,
                  district_id:
                    facility.districtRegistryId,
                  active_facility_placement_id:
                    facility.activeFacilityPlacementId,
                  placement_x:
                    facility.placementX,
                  placement_y:
                    facility.placementY,
                  rotation_code:
                    facility.rotation,
                  placement_status:
                    facility.placementStatus,
                  route_readiness:
                    "blocked" as const,
                  route_readiness_reasons:
                    uniqueReasons(
                      reasons
                    )
                };
              }
            );

          const projectionReasons = [
            ...requiredReasons
          ];

          if (
            districtItems.some(
              (item) =>
                item.route_readiness ===
                "blocked"
            )
          ) {
            projectionReasons.push(
              "district_route_blocked"
            );
          }

          if (
            districtItems.some(
              (item) =>
                item.route_readiness ===
                "partial_data"
            )
          ) {
            projectionReasons.push(
              "district_partial_data"
            );
          }

          if (
            facilityItems.length > 0
          ) {
            projectionReasons.push(
              "facility_routes_blocked"
            );
          }

          const readiness: Readiness =
            requiredReasons.length > 0
              ? "blocked"
              : projectionReasons.length >
                  0
                ? "partial_data"
                : "active";

          return {
            kind: "ok",
            payload: {
              city:
                cityProjection(city),
              districts:
                districtItems,
              facilities:
                facilityItems,
              readiness,
              partial_data_reasons:
                uniqueReasons(
                  projectionReasons
                ),
              projection_version:
                PROJECTION_VERSION
            }
          } as const;
        }
      );

    if (
      result.kind ===
      "forbidden"
    ) {
      return errorResponse(
        403,
        "forbidden"
      );
    }

    if (
      result.kind ===
      "not_found"
    ) {
      return errorResponse(
        404,
        "city_not_found"
      );
    }

    return jsonResponse(
      result.payload
    );
  } catch (error) {
    if (
      error instanceof
      CivilizationPersistenceUnavailableError
    ) {
      return errorResponse(
        503,
        "persistence_unavailable"
      );
    }

    return errorResponse(
      503,
      "persistence_unavailable"
    );
  }
}

export async function readDistrictApi(
  request: NextRequest,
  districtRegistryId: string
): Promise<NextResponse> {
  if (
    !validUuid(
      districtRegistryId
    )
  ) {
    return errorResponse(
      400,
      "invalid_district_registry_id"
    );
  }

  const sessionActorKey =
    actorKey(request);

  if (!sessionActorKey) {
    return errorResponse(
      401,
      "unauthenticated"
    );
  }

  try {
    const result =
      await withCivilizationReadTransaction(
        async (client) => {
          const district =
            await findDistrict(
              client,
              districtRegistryId
            );

          if (!district) {
            return {
              kind: "not_found"
            } as const;
          }

          const allowed =
            await hasNationReadAuthorization(
              client,
              sessionActorKey,
              district.nationId
            );

          if (!allowed) {
            return {
              kind: "forbidden"
            } as const;
          }

          const [
            city,
            territory
          ] = await Promise.all([
            findCity(
              client,
              district.nationId,
              district.cityCode
            ),
            findTerritory(
              client,
              district.nationId,
              district.territoryCode
            )
          ]);

          const route =
            districtReadiness(
              district,
              city,
              territory
            );

          return {
            kind: "ok",
            payload: {
              district:
                districtProjection(
                  district,
                  route
                ),
              city:
                city
                  ? cityProjection(
                      city
                    )
                  : null,
              readiness:
                route.readiness,
              partial_data_reasons:
                route.reasons,
              projection_version:
                PROJECTION_VERSION
            }
          } as const;
        }
      );

    if (
      result.kind ===
      "not_found"
    ) {
      return errorResponse(
        404,
        "district_not_found"
      );
    }

    if (
      result.kind ===
      "forbidden"
    ) {
      return errorResponse(
        403,
        "forbidden"
      );
    }

    return jsonResponse(
      result.payload
    );
  } catch {
    return errorResponse(
      503,
      "persistence_unavailable"
    );
  }
}

export async function readFacilityApi(
  request: NextRequest,
  facilityRegistryId: string
): Promise<NextResponse> {
  if (
    !validUuid(
      facilityRegistryId
    )
  ) {
    return errorResponse(
      400,
      "invalid_facility_registry_id"
    );
  }

  const sessionActorKey =
    actorKey(request);

  if (!sessionActorKey) {
    return errorResponse(
      401,
      "unauthenticated"
    );
  }

  try {
    const result =
      await withCivilizationReadTransaction(
        async (client) => {
          const facility =
            await findFacility(
              client,
              facilityRegistryId
            );

          if (!facility) {
            return {
              kind: "not_found"
            } as const;
          }

          const placement =
            await findCurrentActivePlacement(
              client,
              facilityRegistryId
            );

          const authorizationNationId =
            placement?.nationId ??
            facility.ownerNationId;

          const allowed =
            await hasNationReadAuthorization(
              client,
              sessionActorKey,
              authorizationNationId
            );

          if (!allowed) {
            return {
              kind: "forbidden"
            } as const;
          }

          const city =
            placement
              ? await findCity(
                  client,
                  placement.nationId,
                  placement.cityCode
                )
              : null;

          const territoryNationId =
            placement?.nationId ??
            facility.ownerNationId;

          const territoryCode =
            placement?.territoryCode ??
            facility.registryTerritoryCode;

          const territory =
            await findTerritory(
              client,
              territoryNationId,
              territoryCode
            );

          const reasons = [
            "facility_type_unresolved",
            "canonical_ui_target_unresolved"
          ];

          if (
            facility.facilityStatus !==
            "active"
          ) {
            reasons.push(
              "facility_not_active"
            );
          }

          if (!placement) {
            reasons.push(
              "active_placement_missing"
            );
          }

          if (
            placement &&
            !city
          ) {
            reasons.push(
              "city_binding_unresolved"
            );
          } else if (
            city &&
            !city.currentActive
          ) {
            reasons.push(
              "city_not_current_active"
            );
          }

          if (!territory) {
            reasons.push(
              "territory_binding_unresolved"
            );
          } else if (
            !territory.currentActive
          ) {
            reasons.push(
              "territory_not_current_active"
            );
          }

          if (
            placement &&
            city &&
            city.territoryCode !==
              placement.territoryCode
          ) {
            reasons.push(
              "city_territory_binding_mismatch"
            );
          }

          return {
            kind: "ok",
            payload: {
              facility: {
                facility_id:
                  facility.facilityRegistryId,
                facility_registry_id:
                  facility.facilityRegistryId,
                facility_type:
                  null,
                facility_name:
                  facility.facilityName,
                facility_status:
                  facility.facilityStatus,
                canonical_ui_target:
                  null,
                territory_code:
                  territoryCode,
                district_id:
                  placement?.districtRegistryId ??
                  null,
                city_code:
                  placement?.cityCode ??
                  null,
                active_facility_placement_id:
                  placement?.activeFacilityPlacementId ??
                  null,
                placement_x:
                  placement?.placementX ??
                  null,
                placement_y:
                  placement?.placementY ??
                  null,
                rotation_code:
                  placement?.rotation ??
                  null,
                placement_status:
                  placement?.placementStatus ??
                  null,
                route_readiness:
                  "blocked" as const,
                route_readiness_reasons:
                  uniqueReasons(
                    reasons
                  )
              },
              city:
                city
                  ? cityProjection(
                      city
                    )
                  : null,
              readiness:
                "blocked" as const,
              partial_data_reasons:
                uniqueReasons(
                  reasons
                ),
              projection_version:
                PROJECTION_VERSION
            }
          } as const;
        }
      );

    if (
      result.kind ===
      "not_found"
    ) {
      return errorResponse(
        404,
        "facility_not_found"
      );
    }

    if (
      result.kind ===
      "forbidden"
    ) {
      return errorResponse(
        403,
        "forbidden"
      );
    }

    return jsonResponse(
      result.payload
    );
  } catch {
    return errorResponse(
      503,
      "persistence_unavailable"
    );
  }
}
