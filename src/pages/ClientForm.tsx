import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppContext } from '../context/AppContext';
import supabase from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DialogClose } from '@radix-ui/react-dialog';

interface ClientFormProps {
  mode: 'add' | 'edit';
}

const ClientForm: React.FC<ClientFormProps> = ({ mode }) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { clients, services } = useAppContext();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [editingType, setEditingType] = useState<'testimonial' | 'faq'>('testimonial');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form values
  const initialValues = {
    companyName: '',
    companyId: '',
    phone: '',
    websiteLink: '',
    slug: '',
    favicon: '',
    logo: '',
  };

// Fetch client data and selected services if in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const client = clients.find((client: any) => client.id === id);
      if (client) {
        formik.setValues({
          companyName: client.name,
          companyId: client.id,
          phone: client.phone || '',
          websiteLink: client.websiteLink || '',
          slug: client.slug,
          favicon: client.favicon,
          logo: client.content?.logo || '',
        });

        if (client.testimonials) setTestimonials(client.testimonials);
        if (client.faqs) setFaqs(client.faqs);
      }

      // Fetch selected services from contractor_services table
      const fetchSelectedServices = async () => {
        const { data, error } = await supabase
          .from('contractor_services')
          .select('service_id')
          .eq('contractor_id', id);

        if (error) {
          console.error('Error fetching selected services:', error);
          return;
        }

        // Extract service IDs and set selected services
        const serviceIds = data.map((item: any) => item.service_id);
        setSelectedServices(serviceIds);
      };

      fetchSelectedServices();
    }
  }, [mode, id, clients]);

  // Form validation schema
  const validationSchema = Yup.object({
    companyName: Yup.string().required('Company name is required'),
    companyId: Yup.string().required('Company ID is required'),
    websiteLink: Yup.string().required('Website link is required'),
    slug: Yup.string().required('Slug is required'),
    favicon: Yup.string().required('Favicon is required'),
    logo: Yup.string().required('Logo is required'),
  });

  // Handle service selection
  const handleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId) // Deselect if already selected
        : [...prev, serviceId] // Select if not already selected
    );
  };

  // Formik form handling

     // Generic item handlers
  const handleSaveItem = (item: any) => {
    if (editingType === 'testimonial') {
      const avatars = [
        "https://avatar.vercel.sh/jack",
        "https://avatar.vercel.sh/jill",
        "https://avatar.vercel.sh/james"
      ];
            
      const newItem = isEditing ? item : {
        ...item,
        id: (testimonials.length + 1).toString(), // Convert to string
        img: avatars[testimonials.length % 3]
      };

      setTestimonials(prev => 
        isEditing 
          ? prev.map(t => t.id === item.id ? newItem : t)
          : [...prev, newItem]
      );
    } else {
      const newItem = isEditing ? item : {
        ...item,
        id: (faqs.length + 1).toString() // Convert to string
      };

      setFaqs(prev =>
        isEditing
          ? prev.map(f => f.id === item.id ? newItem : f)
          : [...prev, newItem]
      );
    }
    setCurrentItem(null);
    setIsEditing(false);
  };

  const handleDeleteItem = (id: string, type: 'testimonial' | 'faq') => {
    if (type === 'testimonial') {
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } else {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  // Update form submission to include testimonials
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const clientData = {
          name: values.companyName,
          id: values.companyId,
          phone: values.phone,
          websiteLink: values.websiteLink,
          slug: values.slug,
          favicon: values.favicon,
          content: { logo: values.logo },
          testimonials,
          faqs,
          updated_at: new Date().toISOString(),
        };

        if (mode === 'edit' && id) {
          // Update existing client in Supabase
          {
            const { error: clientError } = await supabase
              .from('contractors')
              .update(clientData)
              .eq('id', id);

          if (clientError) throw clientError;

          // Update contractor_services table
          const { data: existingServices, error: servicesError } = await supabase
            .from('contractor_services')
            .select('service_id')
            .eq('contractor_id', id);

          if (servicesError) throw servicesError;

          const existingServiceIds = existingServices.map((item: any) => item.service_id);

          // Add new services
          for (const serviceId of selectedServices) {
            if (!existingServiceIds.includes(serviceId)) {
              const { error: insertError } = await supabase
                .from('contractor_services')
                .insert([{ contractor_id: id, service_id: serviceId }]);

              if (insertError) throw insertError;
            }
          }

          // Remove unselected services
          for (const serviceId of existingServiceIds) {
            if (!selectedServices.includes(serviceId)) {
              const { error: deleteError } = await supabase
                .from('contractor_services')
                .delete()
                .eq('contractor_id', id)
                .eq('service_id', serviceId);

              if (deleteError) throw deleteError;
            }
          }
        }
        } else {
          // Add new client to Supabase
          const { error: clientError } = await supabase
            .from('contractors')
            .insert([clientData]);

          if (clientError) throw clientError;

          // Add selected services to contractor_services table
          for (const serviceId of selectedServices) {
            const { error: insertError } = await supabase
              .from('contractor_services')
              .insert([{ contractor_id: values.companyId, service_id: serviceId }]);

            if (insertError) throw insertError;
          }
        }

        navigate('/');
      } catch (error) {
        console.error('Error saving client:', error);
        alert('An error occurred while saving the client.');
      }
    },
  });

  // Handle cancel button click
  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" id="modal-form" className="hidden"></button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit' : 'Add'} {editingType}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? `Update this ${editingType}`
                : `Create a new ${editingType}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="max-w-sm">
              <label htmlFor="input-label" className="text-sm font-medium mb-2">
                {editingType === 'testimonial' ? 'Name' : 'Question'}
              </label>
              <input 
                type="text" 
                id="item-name"
                defaultValue={
                  editingType === 'testimonial'
                    ? currentItem?.name || ''
                    : currentItem?.question || ''
                }
                onChange={(e) =>
                  setCurrentItem((prev: any) => ({
                    ...prev,
                    [editingType === 'testimonial' ? 'name' : 'question']: e.target.value,
                  }))
                }
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={
                  editingType === 'testimonial' ? 'Enter name' : 'Enter question'
                }
              />
            </div>
            <div className="max-w-sm">
              <label htmlFor="textarea-label" className="block text-sm font-medium mb-2">
                {editingType === 'testimonial' ? 'Message' : 'Answer'}
              </label>
              <textarea 
                id="item-content"
                defaultValue={
                  editingType === 'testimonial'
                    ? currentItem?.body || ''
                    : currentItem?.answer || ''
                }
                onChange={(e) =>
                  setCurrentItem((prev: any) => ({
                    ...prev,
                    [editingType === 'testimonial' ? 'body' : 'answer']: e.target.value,
                  }))
                }
                className="py-3 px-4 block w-full border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder={
                  editingType === 'testimonial' ? 'Enter message' : 'Enter answer'
                }
              />
            </div>
          </div>
          <DialogFooter>
          <DialogClose>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => handleSaveItem(currentItem)}
            >
              Save Changes
            </button>
          </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="w-full lg:ps-64">
        <div className="max-w-7xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
          <div className="bg-white rounded-xl shadow p-4 sm:p-7">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800">
                {mode === 'add' ? 'Add New Client' : 'Edit Client'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'add' 
                  ? 'Fill in the details of the new client.'
                  : 'Edit the details of the client.'}
              </p>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">
                <div className="sm:col-span-3">
                  <label htmlFor="companyName" className="form-label">Company Name</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="companyName"
                    type="text"
                    className="form-input"
                    placeholder="Sample Company Name"
                    {...formik.getFieldProps('companyName')}
                  />
                  {formik.touched.companyName && formik.errors.companyName ? (
                    <div className="text-red-500 text-sm">{formik.errors.companyName}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="companyId" className="form-label">Company ID</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="companyId"
                    type="text"
                    className="form-input"
                    placeholder="00000"
                    {...formik.getFieldProps('companyId')}
                  />
                  {formik.touched.companyId && formik.errors.companyId ? (
                    <div className="text-red-500 text-sm">{formik.errors.companyId}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="form-label">Phone</label>
                </div>
                <div className="sm:col-span-9">
                  <div className='flex items-start'>
                    <input
                      id="phone"
                      type="text"
                      className="form-input rounded-l-sm"
                      placeholder="+19999999999"
                      {...formik.getFieldProps('phone')}
                    />
                  </div>
                  {formik.touched.phone && formik.errors.phone ? (
                      <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                    ) : null}
                  
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="websiteLink" className="form-label">Company Website</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="websiteLink"
                    type="text"
                    className="form-input"
                    placeholder="https://www.sample.com"
                    {...formik.getFieldProps('websiteLink')}
                  />
                  {formik.touched.websiteLink && formik.errors.websiteLink ? (
                    <div className="text-red-500 text-sm">{formik.errors.websiteLink}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="slug" className="form-label">Slug (Company Name)</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="slug"
                    type="text"
                    className="form-input"
                    placeholder="sample-company-name"
                    {...formik.getFieldProps('slug')}
                  />
                  {formik.touched.slug && formik.errors.slug ? (
                    <div className="text-red-500 text-sm">{formik.errors.slug}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="favicon" className="form-label">Favicon Link</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="favicon"
                    type="text"
                    className="form-input"
                    placeholder="https://www.sample.com/favicon.ico"
                    {...formik.getFieldProps('favicon')}
                  />
                  {formik.touched.favicon && formik.errors.favicon ? (
                    <div className="text-red-500 text-sm">{formik.errors.favicon}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="logo" className="form-label">Logo Link</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="logo"
                    type="text"
                    className="form-input"
                    placeholder="https://www.sample.com/logo.png"
                    {...formik.getFieldProps('logo')}
                  />
                  {formik.touched.logo && formik.errors.logo ? (
                    <div className="text-red-500 text-sm">{formik.errors.logo}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label className="form-label">Services</label>
                </div>
                <div className="sm:col-span-9 flex flex-wrap gap-x-6">
                  {services.map((service: any) => (
                    <div key={service.id} className="flex">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        className="shrink-0 mt-0.5 border-gray-200 rounded-full text-blue-600 focus:ring-blue-500"
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceSelection(service.id)}
                      />
                      <label
                        htmlFor={`service-${service.id}`}
                        className="text-sm text-gray-600 ms-2"
                      >
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Testimonials Section */}
                <div className="sm:col-span-12 mt-2">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                      <div>
                      <h2 className="text-base font-semibold text-gray-700">Testimonials</h2>
                      </div>
                      <div>
                        <div className="inline-flex gap-x-2">

                        <button 
                          type="button"
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => {
                            setEditingType('testimonial');
                            setIsEditing(false);
                            setCurrentItem(null);
                            document.getElementById('modal-form')?.click();
                          }}
                        >
                          Add Testimonial
                        </button>
                        </div>
                      </div>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
                              <div className="flex items-center gap-x-2">
                                <span className="ps-6 text-xs font-semibold uppercase tracking-wide text-gray-800">
                                  Name
                                </span>
                              </div>
                            </th>

                            <th scope="col" className="px-6 py-3 text-start">
                              <div className="flex items-center gap-x-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                                  Message
                                </span>
                              </div>
                            </th>
                            
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                        {testimonials.map((testimonial) => (
                          <tr key={testimonial.id}>
                            <td className="ps-6 py-4 whitespace-normal text-sm text-gray-800 max-w-[100px]">
                              <div className="flex items-center gap-x-2">
                                <span className="text-sm text-gray-800">
                                {testimonial.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 max-w-xs whitespace-normal">
                              <div className="flex items-center gap-x-2">
                                <span className="text-sm text-gray-800 break-words">
                                  {testimonial.body}
                                </span>
                              </div>
                            </td>
                            <td className="size-px whitespace-nowrap">
                              <div className="px-6 py-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                                  onClick={() => {
                                    setEditingType('testimonial');
                                    setIsEditing(true);
                                    setCurrentItem(testimonial);
                                    document.getElementById('modal-form')?.click();
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                            <td className="size-px whitespace-nowrap">
                              <div className="px-6 py-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                                  onClick={() => handleDeleteItem(testimonial.id, 'testimonial')}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
                </div> 

                {/* FAQs Section */}
                <div className="sm:col-span-12 mt-2">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                      <div>
                      <h2 className="text-base font-semibold text-gray-700">FAQs</h2>
                      </div>
                      <div>
                        <div className="inline-flex gap-x-2">

                        <button 
                          type="button"
                          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => {
                            setEditingType('faq');
                            setIsEditing(false);
                            setCurrentItem(null);
                            document.getElementById('modal-form')?.click();
                          }}
                        >
                          Add FAQ
                        </button>
                        </div>
                      </div>
                    </div>

                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="ps-6 lg:ps-3 xl:ps-0 pe-6 py-3 text-start">
                              <div className="flex items-center gap-x-2">
                                <span className="ps-6 text-xs font-semibold uppercase tracking-wide text-gray-800">
                                  Question
                                </span>
                              </div>
                            </th>

                            <th scope="col" className="px-6 py-3 text-start">
                              <div className="flex items-center gap-x-2">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-800">
                                  Answer
                                </span>
                              </div>
                            </th>
                            
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                        {faqs.map((faq) => (
                          <tr key={faq.id}>
                            <td className="ps-6 py-4 whitespace-normal text-sm text-gray-800 max-w-[100px]">
                              <div className="flex items-center gap-x-2">
                                <span className="text-sm text-gray-800">
                                {faq.question}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-800 max-w-xs whitespace-normal">
                              <div className="flex items-center gap-x-2">
                                <span className="text-sm text-gray-800 break-words">
                                  {faq.answer}
                                </span>
                              </div>
                            </td>
                            <td className="size-px whitespace-nowrap">
                              <div className="px-6 py-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                                  onClick={() => {
                                    setEditingType('faq');
                                    setIsEditing(true);
                                    setCurrentItem(faq);
                                    document.getElementById('modal-form')?.click();
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                            <td className="size-px whitespace-nowrap">
                              <div className="px-6 py-1.5">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium"
                                  onClick={() => handleDeleteItem(faq.id, 'faq')}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        </tbody>
                    </table>
                  </div>
                </div> 
              </div>
              <div className="sticky bottom-0 bg-white py-6 mt-5 flex justify-end gap-x-2">
                <button
                  type="button"
                  className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:bg-gray-50"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientForm;