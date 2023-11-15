const faqs = [
  {
    id: 1,
    question: "What's Gov Cycle?",
    answer: (
      <p>
        A Governance Cycle is a set amount of time that a DAO has to propose,
        discuss, vote, and execute proposals.{" "}
        <a
          href="https://docs.nance.app/docs/basics/governance-cycle"
          className="hover:underline"
        >
          Learn more.
        </a>
      </p>
    ),
  },
  {
    id: 2,
    question: "What's Temp Check?",
    answer: (
      <p>
        An informal poll conducted through the discussion platform using simple
        👍 👎 reactions, allowing members to decide whether a proposal should
        move to the voting stage.{" "}
        <a
          href="https://docs.nance.app/docs/basics/temperature-check"
          className="hover:underline"
        >
          Learn more.
        </a>
      </p>
    ),
  },
  {
    id: 3,
    question: "What's Voting rules?",
    answer:
      "I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
];

export default function AestheticsStep() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">
            Welcome to Nance, let&apos;s create your space.
          </h2>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Here are some key concepts to get you started.
          </p>
        </div>
        <div className="mt-20">
          <dl className="space-y-16 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-16 sm:space-y-0 lg:gap-x-10">
            {faqs.map((faq) => (
              <div key={faq.id}>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  {faq.question}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
