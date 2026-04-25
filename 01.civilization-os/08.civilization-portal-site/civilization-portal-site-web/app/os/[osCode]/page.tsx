import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OsDetailPage } from "../../../features/os-catalog/os-detail-page";
import { OS_CATALOG } from "../../../mocks/os/catalog";

type PageProps = {
  params: Promise<{
    osCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { osCode } = await params;
  const item = OS_CATALOG.find((entry) => entry.code === osCode);

  if (!item) {
    return {
      title: "OS Not Found | Civilization Portal Site",
      description: "The requested OS entry could not be found.",
    };
  }

  return {
    title: `${item.name} | Civilization Portal Site`,
    description: item.summary,
  };
}

export default async function Page({
  params,
}: PageProps) {
  const { osCode } = await params;
  const item = OS_CATALOG.find((entry) => entry.code === osCode);

  if (!item) {
    notFound();
  }

  return <OsDetailPage os={item} />;
}
