"use client";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import ErrorPage from "next/error";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Page() {
  const { id: _id } = useParams();
  const id = _id as string;
  const {
    data: profile,
    isPending,
    isError,
  } = api.profile.getById.useQuery({ id });

  if (isPending) return <LoadingSpinner big />;
  if (profile == null || profile.name == null || isError)
    return <ErrorPage statusCode={404} />;

  return (
    <>
      <>{profile.name}</>
    </>
  );
}
