import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { Table, TableRow, TableCell } from "@ag-media/react-pdf-table";

Font.register({
  family: "NotoSansDevanagari",
  src: "/fonts/NotoSansDevanagari.ttf",
});

Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf",
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSansDevanagari",
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4CAF50",
    paddingBottom: 5,
  },
  title: { fontSize: 18, fontFamily: "Roboto", marginBottom: 4 },
  companyInfo: { fontSize: 10, color: "#333" },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Roboto",
    color: "#2E7D32",
    marginVertical: 6,
  },
  text: { fontSize: 11, marginBottom: 2 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerCell: {
    flex: 1,
    fontFamily: "Roboto",
    fontSize: 10,
    fontWeight: "bold",
    paddingVertical: 3,
    textAlign: "center",
    color: "#2E7D32",
  },
  row: { flexDirection: "row", borderBottomWidth: 0.3, borderColor: "#ddd" },
  cell: {
    flex: 1,
    fontSize: 10,
    paddingVertical: 3,
    textAlign: "center",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalText: { fontFamily: "Roboto", fontSize: 12, fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 5,
    textAlign: "center",
    fontSize: 10,
    color: "#555",
  },
});

export const InvoicePDF = ({ orderData }: { orderData: any }) => {
  const {
    orderId,
    customerName,
    phone,
    deliveryAddress,
    paymentMethod,
    createdAt,
    items,
    deliveryFee,
    discount,
    totalAmount,
  } = orderData;

  const invoiceNo =
    orderData.invoiceNo ||
    `INV-${new Date().getFullYear()}-${Math.floor(
      Math.random() * 90000 + 10000
    )}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== HEADER ===== */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice - EsyGrab</Text>
          <Text style={styles.companyInfo}>
            Virkuti Online Shopping Pvt. Ltd.
          </Text>
          <Text style={styles.companyInfo}>
            Operating Brand: EsyGrab | PAN: 610364251
          </Text>
          <Text style={styles.companyInfo}>New Baneshwor, Kathmandu</Text>
          <Text style={styles.companyInfo}>
            +9779865053325 / +9779868293232 | www.esygrab.com
          </Text>
          <Text style={styles.companyInfo}>support@esygrab.com</Text>
        </View>

        {/* ===== INVOICE DETAILS ===== */}
        <Text style={styles.sectionTitle}>Invoice Details</Text>
        <Text style={styles.text}>Invoice No: {invoiceNo}</Text>
        <Text style={styles.text}>Order ID: {orderId}</Text>
        <Text style={styles.text}>
          Date: {new Date(createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>Payment Method: {paymentMethod}</Text>

        {/* ===== CUSTOMER DETAILS ===== */}
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <Text style={styles.text}>Name: {customerName}</Text>
        {phone && <Text style={styles.text}>Phone: {phone}</Text>}
        <Text style={styles.text}>Address: {deliveryAddress}</Text>

        {/* ===== ORDER TABLE ===== */}
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <Table>
          {/* Table Header */}
          <TableRow style={styles.tableHeader}>
            <TableCell style={[styles.headerCell, { flex: 0.5 }]}>#</TableCell>
            <TableCell style={[styles.headerCell, { flex: 2 }]}>Item</TableCell>
            <TableCell style={styles.headerCell}>Qty</TableCell>
            <TableCell style={styles.headerCell}>Unit Price (NPR)</TableCell>
            <TableCell style={styles.headerCell}>Total (NPR)</TableCell>
          </TableRow>

          {/* Table Body */}
          {items.map((item: any, i: number) => (
            <TableRow key={i} style={styles.row}>
              <TableCell style={[styles.cell, { flex: 0.5 }]}>
                {i + 1}
              </TableCell>
              <TableCell style={[styles.cell, { flex: 2 }]}>
                {item.name}
              </TableCell>
              <TableCell style={styles.cell}>{item.quantity}</TableCell>
              <TableCell style={styles.cell}>{item.price.toFixed(2)}</TableCell>
              <TableCell style={styles.cell}>
                {(item.quantity * item.price).toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </Table>

        {/* ===== TOTALS ===== */}
        <View style={styles.totalRow}>
          <View>
            <Text>Delivery Charge: Rs {deliveryFee}</Text>
            <Text>Discount: Rs {discount}</Text>
            <Text style={styles.totalText}>Total: Rs {totalAmount}</Text>
          </View>
        </View>

        {/* ===== FOOTER ===== */}
        <Text style={styles.footer}>
          Thank you for ordering with EsyGrab! | For support:
          support@esygrab.com
          {"\n"}EsyGrab – 10 Minutes Delivery
        </Text>
      </Page>
    </Document>
  );
};
