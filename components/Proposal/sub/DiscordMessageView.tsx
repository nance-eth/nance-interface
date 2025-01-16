import { DiscordMessage } from "@/models/DiscordTypes";
import { classNames } from "@/utils/functions/tailwind";
import {
  DocumentTextIcon,
  FilmIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import Image from "next/image";

export default function DiscordMessageView({
  message,
}: {
  message: DiscordMessage;
}) {
  function renderMentions(m: DiscordMessage) {
    let ret = m.content;
    if (m.mentions) {
      m.mentions.forEach((u) => {
        ret = ret.replaceAll(`<@${u.id}>`, `@${u.username}`);
      });
    }
    return ret;
  }

  return (
    <div className="mt-1 text-sm text-gray-700 break-words">
      {/* Reference comment */}
      {message.referenced_message && (
        <div className="bg-gray-100 p-2 rounded-md mb-1">
          <div className="text-gray-500">
            <a
              href={`#comment-${message.referenced_message.id}`}
              className="line-clamp-3 hover:line-clamp-6 "
            >
              {`@${message.referenced_message.author.username}: `}
              {renderMentions(message.referenced_message)}
              {message.referenced_message.attachments.map((attachment, idx) => (
                <PhotoIcon key={attachment.id} className="w-5 h-5" />
              ))}
            </a>
          </div>
        </div>
      )}

      {/* Render message */}
      <p
        id={`comment-${message.id}`}
        className="target:p-2 target:bg-yellow-100 transition-colors duration-1000 scroll-mt-16 md:scroll-mt-24"
      >
        {renderMentions(message)}
      </p>

      {/* Render embeds */}
      {message.embeds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {message.embeds.map((embed, idx) => {
            return (
              <a
                key={idx}
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(
                  "flex items-center gap-2 text-gray-500 rounded-md bg-gray-50 p-2",
                  embed.url && "hover:underline"
                )}
              >
                <FilmIcon className="h-5 w-5 shrink-0" />
                <span className="line-clamp-1">
                  {embed.title || "Untitled embed"}
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* Render attachments */}
      {message.attachments.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {message.attachments.map((attachment, idx) => {
            if (!attachment.content_type?.startsWith("image/")) {
              return (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:underline text-gray-500"
                >
                  <DocumentTextIcon className="h-5 w-5" />
                </a>
              );
            }

            return (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  alt=""
                  height={200}
                  width={200}
                  className="hover:underline"
                  src={attachment.url}
                />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
