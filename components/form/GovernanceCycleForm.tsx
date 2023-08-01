import { ErrorMessage } from "@hookform/error-message";
import { Controller, useFormContext } from "react-hook-form";
import { Tooltip } from "flowbite-react";
import Calendar from '../GovernanceCalendarMini';

export default function GovernanceCyleForm() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div>
      <SmallNumberInput 
        label="Governance Cycle Length"
        name="governanceCycleLength"
        defaultValue={14}
        tooltipContent="This is the total length of time before a governance cycle repeats"
        register={register}
      />
      <div className="flex-col mb-2 w-80">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          Select Start Date
        </label>
        <Calendar
          temperatureCheckLength={3}
          votingLength={4}
          executionLength={4}
          delayLength={3}
        />
      </div>
    </div>
  );
}

const SmallNumberInput = ({
  label, name, register, defaultValue, tooltipContent, className, badgeContent='days' } : {label: string, name: string, register: any, defaultValue: number, tooltipContent?: string, className?: string, badgeContent?: string
  }) => {
  return (
    <div>
      <div className="flex mb-2 mt-2 w-80">
        <label className="block text-sm font-medium text-gray-700 mt-2">
          {label}
        </label>
        {tooltipContent && (
          <div className="ml-1 mt-1">
            <Tooltip content={tooltipContent}>
              <span className="inline-flex items-center justify-center h-4 w-4 text-xs rounded-full bg-gray-400 text-white">?</span>
            </Tooltip>
          </div>
        )}
      </div>
      <div className="mt-1 flex">
        <div className="flex rounded-md border-gray-300 bg-white shadow-sm focus-within:border-indigo-500 focus-within:ring-indigo-500 sm:text-sm">
          <input
            {...register(name,
              { shouldUnregister: true })}
            className="block w-16 rounded-md rounded-r-none border-gray-300 bg-white h-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            type="number"
            min={0}
            defaultValue={defaultValue}
          >
          </input>
          <span className="flex items-center px-3 text-sm text-gray-500 bg-gray-100 rounded-l-none rounded-r-md border border-l-0 border-gray-300">
            {badgeContent}
          </span>
        </div>
      </div>
    </div>
  );
};