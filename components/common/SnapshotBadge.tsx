import Image from "next/image";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const getSnapshotUrl = (space?: string, proposal?: string): string => {
  if (space && proposal) {
    return `https://snapshot.box/#/s:${space}/proposal/${proposal}`;
  }
  if (space) {
    return `https://snapshot.box/#/s:${space}`;
  }
  return "https://snapshot.box/#/explore";
};

export function SnapshotBadge({
  space,
  proposal,
}: {
  space?: string;
  proposal?: string;
}) {
  return (
    <a
      href={getSnapshotUrl(space, proposal)}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-10"
    >
      <div className="
        flex flex-row gap-1
        font-medium text-sm border border-transparent px-2 py-1
        rounded-full text-white bg-gray-500 hover:bg-gray-800
      "
      >
        <Image
          src="/images/snapshot.svg"
          alt="Snapshot Logo"
          width={15}
          height={15}
        />
        snapshot <ArrowTopRightOnSquareIcon className="mt-1 h-3 w-3 mr-1" />
      </div>
    </a>
  );
}
