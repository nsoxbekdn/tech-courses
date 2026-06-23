import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/catalog";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  return <Checkout course={course} />;
}
