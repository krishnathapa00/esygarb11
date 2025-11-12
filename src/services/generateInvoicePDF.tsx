import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/InvoicePDF";
import { supabase } from "@/integrations/supabase/client";

export const handleInvoiceGeneration = async (orderData: any) => {
  try {
    if (!orderData?.userId || !orderData?.orderId || !orderData?.userEmail) {
      throw new Error(
        "Invalid order data: missing userId, orderId, or userEmail"
      );
    }

    // Generate the PDF
    const instance = pdf(<InvoicePDF orderData={orderData} />);
    const pdfBlob = await instance.toBlob();

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error("Generated PDF Blob is empty");
    }

    // Convert Blob to Uint8Array for upload
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileName = `${orderData.userId}/EsyGrab_Invoice-${orderData.orderId}.pdf`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, uint8Array, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL for record-keeping
    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) throw new Error("Failed to retrieve public URL");

    // Update database with invoice link
    const { error: updateError } = await supabase
      .from("orders")
      .update({ invoice_url: publicUrl })
      .eq("order_number", orderData.orderId);

    if (updateError) throw updateError;

    // Convert PDF to base64 (for email attachment)
    const base64Pdf = await blobToBase64(pdfBlob);

    const { error: funcError } = await supabase.functions.invoke(
      "send-invoice",
      {
        body: {
          orderData: {
            orderId: orderData.orderId,
            userEmail: orderData.userEmail,
            customerName: orderData.customerName || "",
          },
          base64Pdf,
        },
      }
    );

    if (funcError) throw funcError;

    console.log("Invoice email sent successfully!");
    return publicUrl;
  } catch (error) {
    console.error("Failed to generate/upload/send invoice:", error);
    throw error;
  }
};

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) resolve(base64);
      else reject("Failed to convert blob to base64");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
