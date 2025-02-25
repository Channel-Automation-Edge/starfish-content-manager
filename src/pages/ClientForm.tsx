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

type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

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
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize form values
  const initialValues = {
    companyName: '',
    companyId: '',
    phone: '',
    websiteLink: '',
    slug: '',
    favicon: '',
    logo: '',
    b_roll: '',
    bg_photo: '',
    hero_h1: '',
    hero_lede: '',
    hero_cta: '',
    feature_header: '',
    feature_description: '',
    feature_list: ['Skilled Professionals', 'Excellence Guaranteed', 'No Hidden Costs'] as string[],
    feature_photo: '',
    accent: '#FA5100',
    accentLight: '#fff1eb',
    accentDark: '#d84a05',
    accentDarker: '#ab3c06',
    accentRGBA: 'rgba(250, 81, 0, 1)',
    time_slots: {
      Monday: [] as string[],
      Tuesday: [] as string[],
      Wednesday: [] as string[],
      Thursday: [] as string[],
      Friday: [] as string[],
      Saturday: [] as string[],
      Sunday: [] as string[],
    },
    from: 3,
    after: 14,
    holidays: [] as string[],
    timezone: '',
    privacy_policy_link: '',
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
          b_roll: client.content?.b_roll || '',
          bg_photo: client.content?.bg_photo || '',
          hero_h1: client.content?.hero_h1 || '',
          hero_lede: client.content?.hero_lede || '',
          hero_cta: client.content?.hero_cta || '',
          feature_header: client.content?.feature_header || '',
          feature_description: client.content?.feature_description || '',
          feature_list: client.content?.feature_list || ['Skilled Professionals', 'Excellence Guaranteed', 'No Hidden Costs'],
          feature_photo: client.content?.feature_photo || '',
          accent: client.colors?.accent || '#FA5100',
          accentLight: client.colors?.light || '#fff1eb',
          accentDark: client.colors?.dark || '#d84a05',
          accentDarker: client.colors?.darker || '#ab3c06',
          accentRGBA: client.colors?.accent_rgba || 'rgba(250, 81, 0, 1)',
          time_slots: client.time_slots || initialValues.time_slots,
          from: client.disabled_dates?.from || 3,
          after: client.disabled_dates?.after || 14,
          holidays: client.disabled_dates?.holidays || [],
          timezone: client.timezone || 'America/New_York',
          privacy_policy_link: client.privacy_policy_link || '',
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
    slug: Yup.string().required('Slug is required'),
  });

  // Handle service selection
  const handleServiceSelection = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId) // Deselect if already selected
        : [...prev, serviceId] // Select if not already selected
    );
  };



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
      console.log('Submitting form with values:', values);
      try {
        const clientData = {
          name: values.companyName,
          id: values.companyId,
          phone: values.phone,
          websiteLink: values.websiteLink,
          slug: values.slug,
          favicon: values.favicon,
          content: { 
            logo: values.logo,
            b_roll: values.b_roll,
            bg_photo: values.bg_photo,
            hero_h1: values.hero_h1,
            hero_lede: values.hero_lede,
            hero_cta: values.hero_cta,
            feature_header: values.feature_header,
            feature_description: values.feature_description,
            feature_list: values.feature_list,
            feature_photo: values.feature_photo,
          },
          testimonials,
          faqs,
          updated_at: new Date().toISOString(),
          colors: {
            accent: formik.values.accent,
            light: formik.values.accentLight,
            dark: formik.values.accentDark,
            darker: formik.values.accentDarker,
            accent_rgba: formik.values.accentRGBA,
          },
          time_slots: values.time_slots,
          disabled_dates: {
            from: values.from,
            after: values.after,
            holidays: values.holidays.map((date) => convertToISO8601(date)), // Convert to ISO 8601
          },
          timezone: values.timezone,
          privacy_policy_link: values.privacy_policy_link,  
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

  // hex to rgba converter
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    console.log("hex", hex);
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    let r, g, b;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return 'rgba(0, 0, 0, 1)';
    }
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // update accentRGBA when accent changes
  useEffect(() => {
    console.log("updating accent");
    const rgba = hexToRgba(formik.values.accent);
    formik.setFieldValue('accentRGBA', rgba);
  }, [formik.values.accent]);

  const handleAddFeature = () => {
    if (formik.values.feature_list.length < 10) {
      formik.setFieldValue('feature_list', [...formik.values.feature_list, '']);
    }
  };
  
  const handleRemoveFeature = (index: number) => {
    const newFeatures = formik.values.feature_list.filter((_, i) => i !== index);
    formik.setFieldValue('feature_list', newFeatures);
  };

  const handleAddTimeSlot = () => {
    const currentSlots = formik.values.time_slots[selectedDay];
    formik.setFieldValue(`time_slots.${selectedDay}`, [...currentSlots, '']);
  };
  
  const handleRemoveTimeSlot = (index: number) => {
    const currentSlots = formik.values.time_slots[selectedDay].filter((_, i) => i !== index);
    formik.setFieldValue(`time_slots.${selectedDay}`, currentSlots);
  };
  
  const handleApplyToAllDays = () => {
    const currentSlots = [...formik.values.time_slots[selectedDay]];
    const newTimeSlots = { ...formik.values.time_slots };
  
    (Object.keys(newTimeSlots) as DayOfWeek[]).forEach((day) => {
      newTimeSlots[day] = [...currentSlots];
    });
  
    formik.setFieldValue('time_slots', newTimeSlots);
  };
  
  const handleTimeSlotChange = (index: number, value: string) => {
    const newSlots = [...formik.values.time_slots[selectedDay]];
    newSlots[index] = value;
    formik.setFieldValue(`time_slots.${selectedDay}`, newSlots);
  };

  const handleAddHoliday = () => {
    if (formik.values.holidays.length < 10) {
      formik.setFieldValue('holidays', [...formik.values.holidays, '']);
    }
  };
  
  const handleRemoveHoliday = (index: number) => {
    const newHolidays = formik.values.holidays.filter((_, i) => i !== index);
    formik.setFieldValue('holidays', newHolidays);
  };

  const convertToISO8601 = (dateString: string): string => {
    // Append a time (e.g., midnight) and a timezone offset (e.g., UTC)
    return `${dateString}T00:00:00Z`; // Example: "2025-03-05T00:00:00Z"
  };

  const parseDateWithoutTimezone = (dateString: string): string => {
    // Extract the date part (YYYY-MM-DD) from the ISO 8601 string
    return dateString.split('T')[0];
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
        <form onSubmit={formik.handleSubmit}>
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
                  <label htmlFor="timezone" className="form-label">Timezone</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="timezone"
                    type="text"
                    className="form-input"
                    placeholder="America/New_York"
                    {...formik.getFieldProps('timezone')}
                  />
                  {formik.touched.timezone && formik.errors.timezone ? (
                    <div className="text-red-500 text-sm">{formik.errors.timezone}</div>
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
                  <label htmlFor="privacy_policy_link" className="form-label">Privacy Policy / Terms & Conditions Link</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="privacy_policy_link"
                    type="text"
                    className="form-input"
                    placeholder="https://www.sample.com/privacy-policy"
                    {...formik.getFieldProps('privacy_policy_link')}
                  />
                  {formik.touched.privacy_policy_link && formik.errors.privacy_policy_link ? (
                    <div className="text-red-500 text-sm">{formik.errors.privacy_policy_link}</div>
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

                <div className="sm:col-span-3">
                  <label className="form-label">Colors</label>
                </div>
                {/* Color Pickers */}
                <div className='sm:col-span-9 flex flex-wrap gap-4'>
                  <div className='flex items-center gap-2'>
                    <label className="block text-sm font-medium">Accent</label>
                    <input
                      type="color"
                      className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg"
                      {...formik.getFieldProps('accent')}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <label className="block text-sm font-medium">Accent Light</label>
                    <input
                      type="color"
                      className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg"
                      {...formik.getFieldProps('accentLight')}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <label className="block text-sm font-medium">Accent Dark</label>
                    <input
                      type="color"
                      className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg"
                      {...formik.getFieldProps('accentDark')}
                    />
                  </div>
                  <div className='flex items-center gap-2'>
                    <label className="block text-sm font-medium">Accent Darker</label>
                    <input
                      type="color"
                      className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg"
                      {...formik.getFieldProps('accentDarker')}
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="sm:col-span-12 mt-2">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                      <div>
                        <h2 className="text-base font-semibold text-gray-700">Time Slots</h2>
                      </div>
                      <div>
                        <p>{formik.values.timezone}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap px-6 py-4">
                      <div className="border-e border-gray-200">
                        <nav className="flex flex-col space-y-2" aria-label="Tabs" role="tablist">
                        {days.map((day: DayOfWeek) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={`py-1 pe-4 inline-flex items-center gap-x-2 border-e-2 text-sm whitespace-nowrap focus:outline-none ${
                              selectedDay === day 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-blue-600'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                        </nav>
                      </div>

                      <div className="ms-3 flex-1">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                          {formik.values.time_slots[selectedDay].map((slot, index) => (
                            <div key={index} className="relative flex items-center gap-4 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 ps-3 pe-2">
                              <input
                                type="time"
                                className="py-2  block text-sm"
                                value={slot}
                                onChange={(e) => handleTimeSlotChange(index, e.target.value)}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTimeSlot(index)}
                                className="text-red-400 cursor-pointer"
                              >
                                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="m15 9-6 6" />
                                  <path d="m9 9 6 6" />
                                </svg>
                              </button>
                            </div>
                          ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleAddTimeSlot}
                              className="py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                            >
                              <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                              </svg>
                              Add Time Slot
                            </button>
                            
                            <button
                              type="button"
                              onClick={handleApplyToAllDays}
                              className="py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                            >
                              Apply For All Days
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-12 mt-2">
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 grid gap-3 md:flex md:justify-between md:items-center border-b border-gray-200">
                      <div>
                        <h2 className="text-base font-semibold text-gray-700">Calendar Configurations</h2>
                      </div>
                    </div>

                    <div className="flex flex-wrap px-6 py-4">
                      <div className="sm:col-span-3">
                        <label className="form-label mr-2">Disabled Days from Current Date </label>
                      </div>
                      <div className="sm:col-span-9 mb-2">
                        <input
                          type="number"
                          className="form-input"
                          {...formik.getFieldProps('from')}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="form-label mr-2">Set How Many Days Ahead Users Can Book </label>
                      </div>
                      <div className="sm:col-span-9 mb-2">
                        <input
                          type="number"
                          className="form-input"
                          {...formik.getFieldProps('after')}
                        />
                      </div>

                      <div className="sm:col-span-3 ">
                        <label className="form-label">Unavailable Dates & Holidays</label>
                      </div>
                      <div className="px-6 py-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {formik.values.holidays.map((holiday, index) => (
                              <div key={index} className="relative">
                                <input
                                  type="date"
                                  className="py-3 ps-4 pe-8 block w-full border-gray-200 rounded-lg text-sm border focus:border-blue-500 focus:ring-blue-500"
                                  value={parseDateWithoutTimezone(holiday)} //
                                  onChange={(e) => {
                                    const newHolidays = [...formik.values.holidays];
                                    newHolidays[index] = e.target.value;
                                    formik.setFieldValue('holidays', newHolidays);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHoliday(index)}
                                  className="inline-flex absolute top-[15px] end-[10px] text-red-400 cursor-pointer"
                                >
                                  <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="m15 9-6 6" />
                                    <path d="m9 9 6 6" />
                                  </svg>
                                </button>
                              </div>
                            ))}

                            {formik.values.holidays.length < 10 && (
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleAddHoliday}
                                  className="py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                                >
                                  <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="M12 5v14" />
                                  </svg>
                                  Add Day
                                </button>
                              </div>
                            )}

                            

                          </div>
                        </div>
                      </div>
                     
                    </div>
                  </div>
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
            </div>
            
            <div className="mt-10 bg-white rounded-t-xl shadow p-4 sm:p-7"> 
              <div className="mb-8 sm:col-span-12">
                <h2 className="text-xl font-bold text-gray-800">
                  Other Custom Content
                </h2>
                <p className="text-sm text-gray-600">
                  Optional: Customize media and text. If not defined, default content will be used.
                </p>
              </div>           
              <div className="grid sm:grid-cols-12 gap-2 sm:gap-6">            
                {/* Image for Header */}
                <div className="sm:col-span-12">
                  <img src='/header-guide.jpg' alt="header guide" className="w-full border border-gray-200 rounded-xl shadow-sm " />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="hero_h1" className="form-label">Hero Header</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="hero_h1"
                    type="text"
                    className="form-input"
                    placeholder="Default: Building Better Spaces for Better Living"
                    {...formik.getFieldProps('hero_h1')}
                  />
                  {formik.touched.hero_h1 && formik.errors.hero_h1 ? (
                    <div className="text-red-500 text-sm">{formik.errors.hero_h1}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="hero_lede" className="form-label">Hero Lede</label>
                </div>
                <div className="sm:col-span-9">
                  <textarea
                    id="hero_lede"
                    className="form-input"
                    placeholder="Default: Hi there, receive a customized assessment of your home’s specific needs and expert recommendations tailored just for you by our experienced team"
                    rows={3}
                    {...formik.getFieldProps('hero_lede')}
                  />
                  {formik.touched.hero_lede && formik.errors.hero_lede ? (
                    <div className="text-red-500 text-sm">{formik.errors.hero_lede}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="hero_cta" className="form-label">Hero CTA</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="hero_cta"
                    type="text"
                    className="form-input"
                    placeholder="Default: Get Free Assessment"
                    {...formik.getFieldProps('hero_cta')}
                  />
                  {formik.touched.hero_cta && formik.errors.hero_cta ? (
                    <div className="text-red-500 text-sm">{formik.errors.hero_cta}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="b-roll" className="form-label">B-Roll Video</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="b-roll"
                    type="text"
                    className="form-input"
                    placeholder=""
                    {...formik.getFieldProps('b_roll')}
                  />
                  {formik.touched.b_roll && formik.errors.b_roll ? (
                    <div className="text-red-500 text-sm">{formik.errors.b_roll}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="bg_photo" className="form-label">Background Photo</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="bg_photo"
                    type="text"
                    className="form-input"
                    placeholder="Optional: Will be used if b-roll is not provided"
                    {...formik.getFieldProps('bg_photo')}
                  />
                  {formik.touched.bg_photo && formik.errors.bg_photo ? (
                    <div className="text-red-500 text-sm">{formik.errors.bg_photo}</div>
                  ) : null}
                </div>

                {/* Image for Feature */}
                <div className="sm:col-span-12">
                  <img src='/feature-guide.jpg' alt="feature guide" className="w-full border border-gray-200 rounded-xl shadow-sm " />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="feature_photo" className="form-label">Feature Photo</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="feature_photo"
                    type="text"
                    className="form-input"
                    placeholder="Deafult: photo above"
                    {...formik.getFieldProps('feature_photo')}
                  />
                  {formik.touched.feature_photo && formik.errors.feature_photo ? (
                    <div className="text-red-500 text-sm">{formik.errors.feature_photo}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="feature_header" className="form-label">Feature Header</label>
                </div>
                <div className="sm:col-span-9">
                  <input
                    id="feature_header"
                    type="text"
                    className="form-input"
                    placeholder="Default: Your Dream Home, Our Expertise"
                    {...formik.getFieldProps('feature_header')}
                  />
                  {formik.touched.feature_header && formik.errors.feature_header ? (
                    <div className="text-red-500 text-sm">{formik.errors.feature_header}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="feature_description" className="form-label">Feature Description</label>
                </div>
                <div className="sm:col-span-9">
                  <textarea
                    id="feature_description"
                    className="form-input"
                    placeholder="Default: At {company name}, we specialize in turning your house into a home. Our team of experienced professionals is dedicated to providing top-notch home improvement services tailored to your needs"
                    rows={3}
                    {...formik.getFieldProps('feature_description')}
                  />
                  {formik.touched.feature_description && formik.errors.feature_description ? (
                    <div className="text-red-500 text-sm">{formik.errors.feature_description}</div>
                  ) : null}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="feature_list" className="form-label">Feature List</label>
                </div>
                <div className="sm:col-span-9">
                  <div className="space-y-3" id="feature-list-wrapper">
                    {formik.values.feature_list.map((feature, index) => (
                      <div key={index} className="relative">
                        <input
                          type="text"
                          className="py-3 ps-4 pe-8 block w-full border-gray-200 rounded-lg text-sm border focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter feature"
                          value={feature}
                          onChange={(e) => {
                            const newFeatures = [...formik.values.feature_list];
                            newFeatures[index] = e.target.value;
                            formik.setFieldValue('feature_list', newFeatures);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="inline-flex absolute top-[15px] end-[10px] text-red-400 cursor-pointer"
                        >
                          <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="m15 9-6 6" />
                            <path d="m9 9 6 6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {formik.values.feature_list.length < 10 && (
                    <div className="mt-3 text-end">
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="py-1.5 px-2 inline-flex items-center gap-x-1 text-xs font-medium rounded-full border border-dashed border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <svg className="shrink-0 size-3.5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        Add Feature
                      </button>
                    </div>
                  )}
                  
                  {formik.touched.feature_list && formik.errors.feature_list ? (
                    <div className="text-red-500 text-sm mt-1">{formik.errors.feature_list}</div>
                  ) : null}
                </div>



              </div> {/* End of container */}
              
            
            </div>

            <div className="sticky bottom-0 rounded-b-xl shadow p-4 sm:p-7 border-t border-gray-200 bg-white py-6 flex justify-end gap-x-2">
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
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;