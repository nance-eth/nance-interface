import { classNames } from "@/utils/functions/tailwind";
import PoweredByNance from "./PoweredByNance";
import FormattedAddress from "../AddressCard/FormattedAddress";
import Image from "next/image";

type TopAuthors = {
  author: string;
  count: number;
  approvalRate: string;
};

export function TopAuthorTable({
  loading,
  topAuthors,
}: {
  loading: boolean;
  topAuthors: TopAuthors[];
}) {
  return (
    <div className="card bg-base-100 w-80 sm:w-96 grow">
      <div className="card-body">
        <h2 className="card-title">Top Authors</h2>
        <div className="absolute top-6 right-6 flex items-center">
          <PoweredByNance />
        </div>
      </div>
      <figure className={classNames("h-80", loading && "skeleton")}>
        <div className="overflow-x-auto">
          <table className="table">
            {/* head */}
            <thead>
              <tr>
                <th>Author</th>
                <th>Count</th>
                <th>Approval Rate</th>
              </tr>
            </thead>
            <tbody>
              {topAuthors.map((author, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="mask mask-squircle h-8 w-8">
                          <Image
                            src={`https://cdn.stamp.fyi/avatar/${author.author}`}
                            alt=""
                            width={500}
                            height={500}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">
                          <FormattedAddress
                            address={author.author}
                            copyable={false}
                            link
                            style="mt-1"
                            minified
                          />
                        </div>
                        <div className="text-sm opacity-50"></div>
                      </div>
                    </div>
                  </td>
                  <td>{author.count}</td>
                  <td>{author.approvalRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </figure>
    </div>
  );
}
