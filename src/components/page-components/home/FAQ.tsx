"use client";

import { useState } from "react";
import Bounded from "@/components/layout/bounded/Bounded";
import SplitTextReveal from "@/components/shared/animation/SplitTextReveal";
import SlideUpReveal from "@/components/shared/animation/SlideUpReveal";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  title: string;
  description: string;
  faqs: FaqItem[];
};

const DEFAULT_ANSWER =
  "Use the search bar on the homepage to enter keywords related to your skills, job title, or preferred location. You can also use the advanced search filters to narrow down results by industry, job type (full-time, part-time, freelance), and experience level.";

const DEFAULT_CONTENT: FaqContent = {
  title: "Frequently Asked Questions",
  description:
    "Don't just take our word for it—hear from our students who have transformed their skills and careers with our courses.",
  faqs: [
    {
      question: "How do I create an account on the job board?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "Who can take courses on EducateU?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "How do I enrol in a course?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "How do I create an account on the job board?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "How do I create an account on the job board?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "How do I create an account on the job board?",
      answer: DEFAULT_ANSWER,
    },
    {
      question: "How do I create an account on the job board?",
      answer: DEFAULT_ANSWER,
    },
  ],
};

export default function FAQ({ data }: { data?: Partial<FaqContent> }) {
  const content = { ...DEFAULT_CONTENT, ...data };
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#f8f8f8] to-[#f1fefa] py-16 lg:py-24">
      <Bounded className="relative flex flex-col items-center gap-8 lg:gap-[42px]">
        <div className="flex w-full flex-col items-start gap-4 text-left text-primary-950 md:items-center md:text-center">
          <SplitTextReveal
            as="h2"
            className="type-h2 font-title max-w-3xl font-semibold"
          >
            {content.title}
          </SplitTextReveal>
          <SplitTextReveal
            as="p"
            delay={0.3}
            className="type-lead max-w-3xl text-[#42697c]"
          >
            {content.description}
          </SplitTextReveal>
        </div>

        <div className="flex w-full max-w-[1162px] flex-col gap-6">
          {content.faqs.map((item, index) => {
            const isOpen = index === openIndex;

            return (
              <SlideUpReveal
                key={`${item.question}-${index}`}
                delay={Math.min(index * 0.1, 0.5)}
                className="relative w-full overflow-hidden rounded-3xl"
                disableOnMobile
              >
                {/* Decorative glow elements behind the card, using CSS instead
                    of image assets so the effect stays sharp and lightweight. */}
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl">
                  <div className="absolute inset-x-0 top-0 h-[77px]">
                    <div className="h-16 w-[70%] rounded-full bg-[#1EE9B5]/30 blur-3xl" />
                    <div className="absolute left-[12%] top-2 h-12 w-[30%] rounded-full bg-[#1EE9B5]/25 blur-3xl" />
                    <div className="absolute right-[12%] top-2 h-12 w-[30%] rounded-full bg-[#1EE9B5]/25 blur-3xl" />
                  </div>
                </div>

                <div className="relative z-10 rounded-3xl border border-white/60 bg-[#eceef0] p-6 backdrop-blur-[75px] lg:p-8">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 text-left"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span className="type-h4 font-medium text-[#010502]">
                      {item.question}
                    </span>
                    <img
                      alt=""
                      className="size-6 shrink-0"
                      src={
                        isOpen
                          ? "/faq/icon-minus-circle-dark.svg"
                          : "/faq/icon-plus-circle-dark.svg"
                      }
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      {/* Some CMS answers are plain text, others are rich
                          text (e.g. Support Hub's, wrapped in <p> tags) —
                          rendering via innerHTML handles both the same way,
                          since a plain string with no markup renders
                          identically either way. A <div>, not a <p>, since
                          rich-text answers already contain their own <p>. */}
                      <div
                        className="mt-[11px] type-body font-light text-[#38463c] [&_a]:text-primary-700 [&_a]:underline [&_a]:hover:text-primary-800"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    </div>
                  </div>
                </div>
              </SlideUpReveal>
            );
          })}
        </div>
      </Bounded>
    </section>
  );
}
