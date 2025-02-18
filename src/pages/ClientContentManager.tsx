import { useAppContext } from '../context/AppContext';
import ClipboardButton from '@/components/ClipboardButton';
import { useNavigate } from 'react-router-dom';

const ClientContentManager = () => {
  const { clients } = useAppContext(); // Access clients from AppContext
  const navigate = useNavigate();

  // Function to determine if a client is complete
  const isClientComplete = (client: any) => {
    return (
      client.id &&
      client.name &&
      client.time_slots &&
      client.testimonials &&
      client.faqs &&
      client.colors &&
      client.slug &&
      client.content?.logo &&
      client.favicon
    );
  };

  // Function to format the updated_at timestamp
  const formatUpdatedAt = (timestamp: string) => {
    // Parse the timestamp into a Date object
    const date = new Date(timestamp);
  
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', timestamp);
      return 'Invalid Date';
    }
  
    // Format the date and time
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC', // Ensure the time is displayed in UTC
    });
  };

  // Function to handle edit button click
  const handleEditClick = (clientId: string) => {
    navigate(`/clients/${clientId}/edit`);
  };

  //Function to handle add client button click
  const handleAddClientClick = () => {
    navigate('/clients/new');
  };

  return (
    <div>
      <div className="w-full lg:ps-64">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  {/* <!-- Header --> */}
                  <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        Clients
                      </h2>
                      <p className="text-sm text-gray-600 ">
                        Add client, edit and more.
                      </p>
                    </div>

                    <div>
                      <div className="inline-flex gap-x-2">
                        <a className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50" href="#">
                          View all
                        </a>

                        <button className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" onClick={handleAddClientClick}>
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                          </svg>
                          Add client
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* <!-- End Header --> */}

                  {/* <!-- Table --> */}
                  <table className="min-w-full divide-y divide-gray-200 ">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="ps-6 py-3 text-start">
                          <label htmlFor="hs-at-with-checkboxes-main" className="flex">
                            <input type="checkbox" className="shrink-0 border-gray-300 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id="hs-at-with-checkboxes-main"/>
                            <span className="sr-only">Checkbox</span>
                          </label>
                        </th>

                        <th scope="col" className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
                          <div className="flex items-center gap-x-2">
                            <span className="ps-6 text-xs font-semibold uppercase tracking-wide text-gray-800">
                              Name
                            </span>
                          </div>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <div className="flex items-center gap-x-2">
                            <span className="ps-8 text-xs font-semibold uppercase tracking-wide text-gray-800">
                              Link
                            </span>
                          </div>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <div className="flex items-center gap-x-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                              Status
                            </span>
                          </div>
                        </th>

                        <th scope="col" className="px-6 py-3 text-start">
                          <div className="flex items-center gap-x-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                              Updated
                            </span>
                          </div>
                        </th>

                        <th scope="col" className="px-6 py-3 text-end"></th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {clients.map((client: any) => (
                        <tr key={client.id}>
                          <td className="size-px whitespace-nowrap">
                            <div className="ps-6 py-3">
                              <label htmlFor={`hs-at-with-checkboxes-${client.id}`} className="flex">
                                <input type="checkbox" className="shrink-0 border-gray-300 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" id={`hs-at-with-checkboxes-${client.id}`}/>
                                <span className="sr-only">Checkbox</span>
                              </label>
                            </div>
                          </td>
                          <td className="size-px whitespace-nowrap ps-4 max-w-lg">
                            <div className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3">
                              <div className="flex items-center gap-x-3">
                              <img
                                className="inline-block size-[38px] rounded-full"
                                src={client.favicon}
                                alt="Avatar"
                              />
                                <div className="grow">
                                  <span className="block text-sm font-semibold text-gray-800">{client.name}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="size-px whitespace-nowrap max-w-sm overflow-hidden">
                            <div className="px-6 py-3 truncate">
                              <ClipboardButton text={`appt.chau.link/${client.slug}?company_id=${client.id}`} />
                            </div>
                          </td>
                          <td className="size-px whitespace-nowrap">
                            <div className="px-6 py-3">
                              <span className={`py-1 px-1.5 inline-flex items-center gap-x-1 text-xs font-medium rounded-full ${isClientComplete(client) ? 'bg-teal-100 text-teal-800' : 'bg-red-100 text-red-800'}`}>
                                {isClientComplete(client) ? 'Complete' : 'Incomplete'}
                              </span>
                            </div>
                          </td>
                          <td className="size-px whitespace-nowrap">
                            <div className="px-6 py-3">
                              <span className="text-sm text-gray-800">
                                {formatUpdatedAt(client.updated_at)}
                              </span>
                            </div>
                          </td>
                          <td className="size-px whitespace-nowrap">
                            <div className="px-6 py-1.5">
                              <button
                                className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                                onClick={() => handleEditClick(client.id)}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* <!-- End Table --> */}

                  {/* <!-- Footer --> */}
                  <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-t border-gray-200 ">
                    <div>
                      <p className="text-sm text-gray-600 ">
                        <span className="font-semibold text-gray-800 ">{clients.length}</span> results
                      </p>
                    </div>

                    <div>
                      <div className="inline-flex gap-x-2">
                        <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50">
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Prev
                        </button>

                        <button type="button" className="py-1.5 px-2 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50">
                          Next
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* <!-- End Footer --> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientContentManager;