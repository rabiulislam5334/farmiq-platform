// "use client";

// import * as React from "react";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { toast } from "sonner";
// import { ImageIcon, Loader2, Upload, X } from "lucide-react";

// import { useUIStore } from "@/store/ui-store";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface Category {
//   id: string;
//   name: string;
// }

// const productSchema = z.object({
//   title: z.string().min(3, "শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে"),
//   description: z.string().optional(),
//   price: z.coerce.number().min(1, "সঠিক দাম দিন"),
//   quantity: z.coerce.number().min(1, "সঠিক পরিমাণ দিন"),
//   unit: z.string().min(1, "একক দিন (যেমন কেজি)"),
//   location: z.string().min(2, "লোকেশন দিন"),
//   categoryId: z.string().min(1, "ক্যাটাগরি নির্বাচন করুন"),
// });

// type ProductValues = z.infer<typeof productSchema>;

// const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dhenkqgra";
// const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

// export default function SellPage() {
//   const { locale } = useUIStore();
//   const router = useRouter();

//   const [categories, setCategories] = React.useState<Category[]>([]);
//   const [imageFile, setImageFile] = React.useState<File | null>(null);
//   const [imagePreview, setImagePreview] = React.useState<string | null>(null);
//   const [uploading, setUploading] = React.useState(false);
//   const [submitting, setSubmitting] = React.useState(false);
//   const [serverError, setServerError] = React.useState<string | null>(null);

//   const form = useForm<ProductValues>({
//     resolver: zodResolver(productSchema),
//     defaultValues: {
//       title: "",
//       description: "",
//       price: 0,
//       quantity: 1,
//       unit: "কেজি",
//       location: "",
//       categoryId: "",
//     },
//   });

//   React.useEffect(() => {
//     async function loadCategories() {
//       try {
//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_URL}/categories`,
//         );
//         const result = await res.json();
//         setCategories(result?.data ?? []);
//       } catch {
//         setCategories([]);
//       }
//     }
//     loadCategories();
//   }, []);

//   React.useEffect(() => {
//     if (!localStorage.getItem("farmiq_access_token")) {
//       router.push("/login");
//     }
//   }, [router]);

//   function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   }

//   async function uploadToCloudinary(file: File): Promise<string> {
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_preset", UPLOAD_PRESET);

//     const res = await fetch(
//       `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
//       { method: "POST", body: formData },
//     );

//     if (!res.ok) throw new Error("Image upload failed");
//     const data = await res.json();
//     return data.secure_url as string;
//   }

//   async function onSubmit(values: ProductValues) {
//     setServerError(null);

//     if (!UPLOAD_PRESET) {
//       setServerError(
//         locale === "bn"
//           ? "Cloudinary upload preset সেট করা নেই — .env.local চেক করুন"
//           : "Cloudinary upload preset not configured — check .env.local",
//       );
//       return;
//     }

//     setSubmitting(true);
//     try {
//       let imageUrl: string | undefined;

//       if (imageFile) {
//         setUploading(true);
//         imageUrl = await uploadToCloudinary(imageFile);
//         setUploading(false);
//       }

//       const token = localStorage.getItem("farmiq_access_token");
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ ...values, imageUrl }),
//       });

//       const result = await res.json();

//       if (!res.ok || !result.success) {
//         const msg = Array.isArray(result.message)
//           ? result.message[0]
//           : result.message;
//         throw new Error(msg ?? "Something went wrong");
//       }

//       toast.success(
//         locale === "bn"
//           ? "পণ্য সফলভাবে যোগ হয়েছে!"
//           : "Product listed successfully!",
//       );
//       router.push(`/products/${result.data.id}`);
//     } catch (err) {
//       setServerError(
//         err instanceof Error
//           ? err.message
//           : locale === "bn"
//             ? "পণ্য যোগ করা যায়নি"
//             : "Couldn't add product",
//       );
//     } finally {
//       setSubmitting(false);
//       setUploading(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[680px] px-6 py-12 lg:px-8">
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//       >
//         <h1 className="font-bangla text-2xl font-bold lg:text-3xl">
//           {locale === "bn"
//             ? "নতুন পণ্য তালিকাভুক্ত করুন"
//             : "List a New Product"}
//         </h1>
//         <p className="mt-1.5 font-bangla text-[15px] text-muted-foreground">
//           {locale === "bn"
//             ? "সঠিক তথ্য দিন, ক্রেতারা সহজে খুঁজে পাবে"
//             : "Fill in accurate details so buyers can find it easily"}
//         </p>

//         <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//               {serverError && (
//                 <div className="rounded-lg bg-danger/10 px-3.5 py-2.5 font-bangla text-sm text-danger">
//                   {serverError}
//                 </div>
//               )}

//               {/* Image upload */}
//               <div>
//                 <label className="mb-2 block font-bangla text-sm font-medium">
//                   {locale === "bn" ? "পণ্যের ছবি" : "Product Image"}
//                 </label>
//                 {imagePreview ? (
//                   <div className="relative h-48 w-full overflow-hidden rounded-xl border border-border">
//                     <img
//                       src={imagePreview}
//                       alt="preview"
//                       className="h-full w-full object-cover"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setImageFile(null);
//                         setImagePreview(null);
//                       }}
//                       className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75"
//                     >
//                       <X className="h-4 w-4" />
//                     </button>
//                   </div>
//                 ) : (
//                   <label className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleFileSelect}
//                       className="hidden"
//                     />
//                     <Upload className="h-7 w-7" />
//                     <span className="font-bangla text-sm">
//                       {locale === "bn" ? "ছবি আপলোড করুন" : "Upload an image"}
//                     </span>
//                   </label>
//                 )}
//               </div>

//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-bangla">
//                       {locale === "bn" ? "পণ্যের নাম" : "Product Title"}
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         placeholder={
//                           locale === "bn"
//                             ? "যেমন: বাসমতি চাল"
//                             : "e.g. Basmati Rice"
//                         }
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="description"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-bangla">
//                       {locale === "bn"
//                         ? "বিবরণ (ঐচ্ছিক)"
//                         : "Description (optional)"}
//                     </FormLabel>
//                     <FormControl>
//                       <Textarea rows={3} className="font-bangla" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="categoryId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="font-bangla">
//                       {locale === "bn" ? "ক্যাটাগরি" : "Category"}
//                     </FormLabel>
//                     <Select
//                       value={field.value}
//                       onValueChange={(v) => {
//                         if (v) field.onChange(v);
//                       }}
//                     >
//                       <FormControl>
//                         <SelectTrigger className="w-full">
//                           <SelectValue
//                             placeholder={
//                               locale === "bn"
//                                 ? "নির্বাচন করুন"
//                                 : "Select category"
//                             }
//                           />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {categories.map((cat) => (
//                           <SelectItem key={cat.id} value={cat.id}>
//                             {cat.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="price"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-bangla">
//                         {locale === "bn" ? "দাম (৳)" : "Price (৳)"}
//                       </FormLabel>
//                       <FormControl>
//                         <Input type="number" min={0} {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="unit"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-bangla">
//                         {locale === "bn" ? "একক" : "Unit"}
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder={locale === "bn" ? "কেজি" : "kg"}
//                           className="font-bangla"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <FormField
//                   control={form.control}
//                   name="quantity"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-bangla">
//                         {locale === "bn" ? "পরিমাণ" : "Quantity"}
//                       </FormLabel>
//                       <FormControl>
//                         <Input type="number" min={1} {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="location"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="font-bangla">
//                         {locale === "bn" ? "লোকেশন" : "Location"}
//                       </FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder={
//                             locale === "bn" ? "যেমন: পাবনা" : "e.g. Pabna"
//                           }
//                           className="font-bangla"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <Button
//                 type="submit"
//                 disabled={submitting}
//                 className="mt-2 w-full gap-2 bg-primary text-white hover:bg-primary-hover"
//                 size="lg"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     {uploading
//                       ? locale === "bn"
//                         ? "ছবি আপলোড হচ্ছে..."
//                         : "Uploading image..."
//                       : locale === "bn"
//                         ? "যোগ করা হচ্ছে..."
//                         : "Publishing..."}
//                   </>
//                 ) : locale === "bn" ? (
//                   "পণ্য প্রকাশ করুন"
//                 ) : (
//                   "Publish Product"
//                 )}
//               </Button>
//             </form>
//           </Form>
//         </div>
//       </motion.div>
//     </div>
//   );
// }
