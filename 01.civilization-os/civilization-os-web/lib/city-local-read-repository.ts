import type {
  PoolClient
} from "pg";

export type CityRegistryRecord = {
  cityRegistryId: string;
  nationId: string;
  cityCode: string;
  cityName: string;
  cityStatus: string;
  territoryCode: string;
  currentActive: boolean;
};

export type TerritoryRecord = {
  territoryRecordId: string;
  nationId: string;
  territoryCode: string;
  territoryName: string;
  territoryStatus: string;
  currentActive: boolean;
};

export type DistrictRegistryRecord = {
  districtRegistryId: string;
  nationId: string;
  cityCode: string;
  districtCode: string;
  districtName: string;
  districtStatus: string;
  districtType: string;
  territoryCode: string;
  boundaryRef: string | null;
  zonePolicyRef: string | null;
};

export type FacilityRegistryRecord = {
  facilityRegistryId: string;
  facilityDomain: string;
  facilityCode: string;
  facilityName: string;
  facilityStatus: string;
  registryTerritoryCode: string;
  ownerNationId: string;
  facilityClass: string;
};

export type ActiveFacilityPlacementRecord = {
  activeFacilityPlacementId: string;
  facilityRegistryId: string;
  nationId: string;
  cityCode: string;
  districtRegistryId: string | null;
  territoryCode: string;
  placementStatus: string;
  placementX: number;
  placementY: number;
  rotation: number | null;
};

export type CityFacilityRecord =
  FacilityRegistryRecord &
  ActiveFacilityPlacementRecord;

type AuthorizationRow = {
  allowed: boolean;
};

type CityRow = {
  city_registry_id: string;
  nation_id: string;
  city_code: string;
  city_name: string;
  city_status: string;
  territory_code: string;
  current_active: boolean;
};

type TerritoryRow = {
  territory_record_id: string;
  nation_id: string;
  territory_code: string;
  territory_name: string;
  territory_status: string;
  current_active: boolean;
};

type DistrictRow = {
  district_registry_id: string;
  nation_id: string;
  city_code: string;
  district_code: string;
  district_name: string;
  district_status: string;
  district_type: string;
  territory_code: string;
  boundary_ref: string | null;
  zone_policy_ref: string | null;
};

type FacilityRow = {
  facility_registry_id: string;
  facility_domain: string;
  facility_code: string;
  facility_name: string;
  facility_status: string;
  registry_territory_code: string;
  owner_nation_id: string;
  facility_class: string;
};

type PlacementRow = {
  active_facility_placement_id: string;
  facility_registry_id: string;
  nation_id: string;
  city_code: string;
  district_registry_id: string | null;
  territory_code: string;
  placement_status: string;
  placement_x: number;
  placement_y: number;
  rotation: number | null;
};

type CityFacilityRow =
  FacilityRow &
  PlacementRow;

function mapCity(
  row: CityRow
): CityRegistryRecord {
  return {
    cityRegistryId:
      row.city_registry_id,
    nationId:
      row.nation_id,
    cityCode:
      row.city_code,
    cityName:
      row.city_name,
    cityStatus:
      row.city_status,
    territoryCode:
      row.territory_code,
    currentActive:
      row.current_active
  };
}

function mapTerritory(
  row: TerritoryRow
): TerritoryRecord {
  return {
    territoryRecordId:
      row.territory_record_id,
    nationId:
      row.nation_id,
    territoryCode:
      row.territory_code,
    territoryName:
      row.territory_name,
    territoryStatus:
      row.territory_status,
    currentActive:
      row.current_active
  };
}

function mapDistrict(
  row: DistrictRow
): DistrictRegistryRecord {
  return {
    districtRegistryId:
      row.district_registry_id,
    nationId:
      row.nation_id,
    cityCode:
      row.city_code,
    districtCode:
      row.district_code,
    districtName:
      row.district_name,
    districtStatus:
      row.district_status,
    districtType:
      row.district_type,
    territoryCode:
      row.territory_code,
    boundaryRef:
      row.boundary_ref,
    zonePolicyRef:
      row.zone_policy_ref
  };
}

function mapFacility(
  row: FacilityRow
): FacilityRegistryRecord {
  return {
    facilityRegistryId:
      row.facility_registry_id,
    facilityDomain:
      row.facility_domain,
    facilityCode:
      row.facility_code,
    facilityName:
      row.facility_name,
    facilityStatus:
      row.facility_status,
    registryTerritoryCode:
      row.registry_territory_code,
    ownerNationId:
      row.owner_nation_id,
    facilityClass:
      row.facility_class
  };
}

function mapPlacement(
  row: PlacementRow
): ActiveFacilityPlacementRecord {
  return {
    activeFacilityPlacementId:
      row.active_facility_placement_id,
    facilityRegistryId:
      row.facility_registry_id,
    nationId:
      row.nation_id,
    cityCode:
      row.city_code,
    districtRegistryId:
      row.district_registry_id,
    territoryCode:
      row.territory_code,
    placementStatus:
      row.placement_status,
    placementX:
      row.placement_x,
    placementY:
      row.placement_y,
    rotation:
      row.rotation
  };
}

export async function hasNationReadAuthorization(
  client: PoolClient,
  actorKey: string,
  nationId: string
): Promise<boolean> {
  const result =
    await client.query<AuthorizationRow>(
      `
      SELECT EXISTS (
        SELECT 1
        FROM civilization.nation_read_authorization a
        WHERE
          a.server_session_actor_key = $1
          AND a.nation_id = $2::uuid
          AND a.scope_code = 'city_local_read'
          AND a.authorization_status = 'active'
          AND a.effective_from <= now()
          AND a.effective_until IS NULL
      ) AS allowed
      `,
      [
        actorKey,
        nationId
      ]
    );

  return (
    result.rows[0]?.allowed === true
  );
}

export async function findCity(
  client: PoolClient,
  nationId: string,
  cityCode: string
): Promise<CityRegistryRecord | null> {
  const result =
    await client.query<CityRow>(
      `
      SELECT
        c.city_registry_id,
        c.nation_id,
        c.city_code,
        c.city_name,
        c.city_status,
        c.territory_code,
        (
          c.city_status = 'active'
          AND c.effective_from <= now()
          AND c.effective_until IS NULL
        ) AS current_active
      FROM civilization.city_registry c
      WHERE
        c.nation_id = $1::uuid
        AND c.city_code = $2
      LIMIT 1
      `,
      [
        nationId,
        cityCode
      ]
    );

  const row =
    result.rows[0];

  return row
    ? mapCity(row)
    : null;
}

export async function findTerritory(
  client: PoolClient,
  nationId: string,
  territoryCode: string
): Promise<TerritoryRecord | null> {
  const result =
    await client.query<TerritoryRow>(
      `
      SELECT
        t.territory_record_id,
        t.nation_id,
        t.territory_code,
        t.territory_name,
        t.territory_status,
        (
          t.territory_status = 'active'
          AND t.effective_from <= now()
          AND t.effective_until IS NULL
        ) AS current_active
      FROM civilization.territory_record t
      WHERE
        t.nation_id = $1::uuid
        AND t.territory_code = $2
      LIMIT 1
      `,
      [
        nationId,
        territoryCode
      ]
    );

  const row =
    result.rows[0];

  return row
    ? mapTerritory(row)
    : null;
}

export async function listDistrictsForCity(
  client: PoolClient,
  nationId: string,
  cityCode: string
): Promise<DistrictRegistryRecord[]> {
  const result =
    await client.query<DistrictRow>(
      `
      SELECT
        d.district_registry_id,
        d.nation_id,
        d.city_code,
        d.district_code,
        d.district_name,
        d.district_status,
        d.district_type,
        d.territory_code,
        d.boundary_ref,
        d.zone_policy_ref
      FROM civilization.district_registry d
      WHERE
        d.nation_id = $1::uuid
        AND d.city_code = $2
      ORDER BY
        d.district_code,
        d.district_registry_id
      `,
      [
        nationId,
        cityCode
      ]
    );

  return result.rows.map(
    mapDistrict
  );
}

export async function findDistrict(
  client: PoolClient,
  districtRegistryId: string
): Promise<DistrictRegistryRecord | null> {
  const result =
    await client.query<DistrictRow>(
      `
      SELECT
        d.district_registry_id,
        d.nation_id,
        d.city_code,
        d.district_code,
        d.district_name,
        d.district_status,
        d.district_type,
        d.territory_code,
        d.boundary_ref,
        d.zone_policy_ref
      FROM civilization.district_registry d
      WHERE
        d.district_registry_id = $1::uuid
      LIMIT 1
      `,
      [
        districtRegistryId
      ]
    );

  const row =
    result.rows[0];

  return row
    ? mapDistrict(row)
    : null;
}

export async function findFacility(
  client: PoolClient,
  facilityRegistryId: string
): Promise<FacilityRegistryRecord | null> {
  const result =
    await client.query<FacilityRow>(
      `
      SELECT
        f.facility_registry_id,
        f.facility_domain,
        f.facility_code,
        f.facility_name,
        f.facility_status,
        f.territory_code
          AS registry_territory_code,
        f.owner_nation_id,
        f.facility_class
      FROM civilization.facility_registry f
      WHERE
        f.facility_registry_id = $1::uuid
      LIMIT 1
      `,
      [
        facilityRegistryId
      ]
    );

  const row =
    result.rows[0];

  return row
    ? mapFacility(row)
    : null;
}

export async function findCurrentActivePlacement(
  client: PoolClient,
  facilityRegistryId: string
): Promise<ActiveFacilityPlacementRecord | null> {
  const result =
    await client.query<PlacementRow>(
      `
      SELECT
        p.active_facility_placement_id,
        p.facility_registry_id,
        p.nation_id,
        p.city_code,
        p.district_registry_id,
        p.territory_code,
        p.placement_status,
        p.x::double precision
          AS placement_x,
        p.y::double precision
          AS placement_y,
        p.rotation::double precision
          AS rotation
      FROM civilization.active_facility_placement p
      WHERE
        p.facility_registry_id = $1::uuid
        AND p.placement_status = 'active'
        AND p.effective_until IS NULL
      LIMIT 1
      `,
      [
        facilityRegistryId
      ]
    );

  const row =
    result.rows[0];

  return row
    ? mapPlacement(row)
    : null;
}

export async function listFacilitiesForCity(
  client: PoolClient,
  nationId: string,
  cityCode: string
): Promise<CityFacilityRecord[]> {
  const result =
    await client.query<CityFacilityRow>(
      `
      SELECT
        f.facility_registry_id,
        f.facility_domain,
        f.facility_code,
        f.facility_name,
        f.facility_status,
        f.territory_code
          AS registry_territory_code,
        f.owner_nation_id,
        f.facility_class,
        p.active_facility_placement_id,
        p.nation_id,
        p.city_code,
        p.district_registry_id,
        p.territory_code,
        p.placement_status,
        p.x::double precision
          AS placement_x,
        p.y::double precision
          AS placement_y,
        p.rotation::double precision
          AS rotation
      FROM civilization.active_facility_placement p
      JOIN civilization.facility_registry f
        ON f.facility_registry_id =
           p.facility_registry_id
      WHERE
        p.nation_id = $1::uuid
        AND p.city_code = $2
        AND p.placement_status = 'active'
        AND p.effective_until IS NULL
      ORDER BY
        f.facility_code,
        f.facility_registry_id
      `,
      [
        nationId,
        cityCode
      ]
    );

  return result.rows.map(
    (row) => ({
      ...mapFacility(row),
      ...mapPlacement(row)
    })
  );
}
