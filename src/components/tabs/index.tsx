import { Tab } from "@headlessui/react";

function classNames(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Tabs({
  summary,
  transcriptions,
}: {
  summary: string;
  transcriptions: string[];
}) {
  return (
    <div className="w-full max-w-md px-2 py-16 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex gap-10 rounded-xl bg-gray-900/60 p-1">
          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ",
                " ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-secondary/10 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Summary
          </Tab>

          <Tab
            className={({ selected }) =>
              classNames(
                "w-full rounded-lg py-2.5 text-sm font-medium leading-5 ",
                "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                selected
                  ? "bg-secondary-300/10 shadow"
                  : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
              )
            }
          >
            Transcription
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2 space-x-10">
          <Tab.Panel>
            <p className="text-lg text-white">{summary}</p>
          </Tab.Panel>
          <Tab.Panel>
            {transcriptions.map((transcription: any, index) => {
              return (
                <div className="bg-white-opacity-5 w-full p-2" key={index}>
                  <h2 className="gradient-text">{transcription?.speaker}</h2>
                  <p className="font-lg text-white">
                    {transcription.utterance}
                  </p>
                  <div className="text-sm font-bold text-gray-100 text-opacity-50">
                    {transcription.timestamp}
                  </div>
                </div>
              );
            })}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
