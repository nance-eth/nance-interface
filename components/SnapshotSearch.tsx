import { useEffect, useState } from 'react'
import { CheckIcon, XCircleIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import { classNames } from '../libs/tailwind'
import useSnapshotSearch, { SpaceSearch } from '../hooks/snapshot/SpaceSearch'
import useSetSpace from '../hooks/snapshot/SetSpace'
import Image from 'next/image'

export default function SnapshotSearch() {
  const [query, setQuery] = useState('')
  const [selectedSpace, setSelectedSpace] = useState<SpaceSearch | null>(null);

  const { data: spaces } = useSnapshotSearch(query);
  const { trigger, value, loading, error, reset } = useSetSpace(selectedSpace ? selectedSpace.id : '');

  return (
    <div className="w-100">
    { selectedSpace && (
      <span className="flex items-center mt-4">
        <Image src={`https://cdn.stamp.fyi/space/${selectedSpace?.id}?s=160}`} alt={selectedSpace?.name || ''} className="ml-3 h-10 w-10 flex-shrink-0 rounded-full" width={100} height={100} />
        <span className="ml-3 block truncate">{selectedSpace?.name}</span>
        <XCircleIcon onClick={() => setSelectedSpace(null)} className="h-5 w-5 text-gray-400 ml-3 cursor-pointer" aria-hidden="true" />
      </span>
    )}
    { !selectedSpace && (
      <Combobox as="div" value={selectedSpace} onChange={setSelectedSpace}>
        <Combobox.Label className="mt-2 block text-sm font-medium leading-6 text-gray-900">snapshot.org space</Combobox.Label>
        <div className="relative mt-2">
          <Combobox.Input
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />

          {spaces && spaces.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {spaces.map((space) => (
                <Combobox.Option
                  key={space.id}
                  value={space}
                  className={({ active }) =>
                    classNames(
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900',
                      'relative cursor-default select-none py-2 pl-3 pr-9'
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <div className="flex items-center">
                        <Image src={`https://cdn.stamp.fyi/space/${space.id}?s=160}`} alt={space.name} className="h-10 w-10 flex-shrink-0 rounded-full" width={100} height={100} />
                        <span
                          className={classNames(selected ? 'font-semibold' : 'font-normal', 'ml-3 block truncate')}
                        >
                          {space.id}
                        </span>
                      </div>

                      {selected ? (
                          <span
                            className={classNames(
                              active ? 'text-white' : 'text-indigo-600',
                              'absolute inset-y-0 right-0 flex items-center pr-4'
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    )}
    {selectedSpace && selectedSpace.id && (
        <>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              trigger()
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
          >
            Add nance as author
          </button>
        </div>
        </>    )}
    </div>
  )
}
