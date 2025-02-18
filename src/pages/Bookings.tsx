import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

const Bookings = () => {
  return (
    <div className="w-full lg:ps-64">
      <Dialog>
              <DialogTrigger asChild>
                <button id='testimonial-button' className=''>asdas</button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit / Add</DialogTitle>
                  <DialogDescription>

                  </DialogDescription>
                </DialogHeader>
                  <div className="space-y-3">
                    <div className="max-w-sm">
                      <label htmlFor="input-label" className="text-sm font-medium mb-2">Name / Question</label>
                      <input type="text" id="input-1" className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm border focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Enter name / Enter Question"/>
                    </div>
                    <div className="max-w-sm">
                      <label htmlFor="textarea-label" className="block text-sm font-medium mb-2">Message / Answer</label>
                      <textarea id="textarea-label" className="py-3 px-4 block w-full border-gray-200 rounded-lg text-sm border focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" rows={3} placeholder="Enter message / Enter Answer"></textarea>
                    </div>
                  </div>
                <DialogFooter>
                  <div className="flex justify-end items-center gap-x-2 py-3 px-4">
                    <DialogClose asChild>
                      <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
                        Close
                      </button>
                    </DialogClose>
                    <button className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none">
                      Save changes
                    </button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

      
    </div>
  )
}

export default Bookings
