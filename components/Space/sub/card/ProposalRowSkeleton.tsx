import { classNames } from "@/utils/functions/tailwind";
import ProposalBadgeLabel from "./ProposalBadgeLabel";
import ColorBar from "@/components/common/ColorBar";

import { motion } from "framer-motion";

export default function ProposalRowSkeleton({
  isFirst = false,
}: {
  isFirst?: boolean;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${!isFirst ? "border-t border-transparent" : ""}`}
    >
      <td className="hidden py-4 pl-6 pr-3 md:table-cell">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="h-6 w-20 rounded-full bg-gray-200"
        />
      </td>

      <td className="px-3 py-4">
        <div className="flex flex-col space-y-3">
          <motion.div
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="h-4 w-full max-w-[300px] rounded bg-gray-200"
          />
          <div className="flex space-x-4">
            <motion.div
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="h-4 w-20 rounded bg-gray-200"
            />
          </div>
        </div>
      </td>

      <td className="hidden py-4 md:table-cell">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="h-4 w-16 rounded bg-gray-200"
        />
      </td>

      <td className="hidden px-3 py-4 md:table-cell">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="h-2 w-full rounded bg-gray-200"
        />
      </td>

      <td className="hidden px-3 py-4 md:table-cell">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="mx-auto h-4 w-12 rounded bg-gray-200"
        />
      </td>

      <td className="hidden px-3 py-4 md:table-cell">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
          className="mx-auto h-8 w-8 rounded bg-gray-200"
        />
      </td>
    </motion.tr>
  );
}
