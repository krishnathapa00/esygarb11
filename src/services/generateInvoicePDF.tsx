import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/InvoicePDF";
import { supabase } from "@/integrations/supabase/client";

export const handleInvoiceGeneration = async (orderData: any) => {
  try {
    if (!orderData?.userId || !orderData?.orderId) {
      throw new Error("Invalid order data: missing userId or orderId");
    }

    const instance = pdf(<InvoicePDF orderData={orderData} />);
    const pdfBlob = await instance.toBlob();

    if (!pdfBlob || pdfBlob.size === 0) {
      throw new Error("Generated PDF Blob is empty");
    }

    const arrayBuffer = await pdfBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const fileName = `${orderData.userId}/EsyGrab_Invoice-${orderData.orderId}.pdf`;

    const { data, error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, uint8Array, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData?.publicUrl;
    if (!publicUrl) {
      throw new Error("Failed to retrieve public URL");
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({ invoice_url: publicUrl })
      .eq("order_number", orderData.orderId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    return publicUrl;
  } catch (error) {
    console.error("Failed to generate/upload invoice:", error);
    throw error;
  }
};



