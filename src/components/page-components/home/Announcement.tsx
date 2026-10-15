import Bounded from "@/components/layout/bounded/Bounded";

export type AnnouncementContent = {
  icon?: { alt?: string; url: string };
  text: string;
  status: boolean;
};

export default function Announcement({
  data,
}: {
  data?: Partial<AnnouncementContent>;
}) {
  if (!data?.status || !data.text) return null;

  return (
    <div className="w-full bg-primary-950 py-3">
      <Bounded className="flex items-start justify-start gap-3 md:px-[60px] lg:px-[60px] xl:px-[60px] 2xl:justify-center">
        {data.icon?.url && (
          <img
            alt={data.icon.alt || ""}
            src={data.icon.url}
            className="size-6 shrink-0 md:size-7 lg:size-8 2xl:size-7"
          />
        )}
        <div
          className="type-lead text-left text-on-dark 2xl:text-center [&_a]:text-primary-500 [&_a]:underline [&_a]:hover:text-primary-400"
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      </Bounded>
    </div>
  );
}
