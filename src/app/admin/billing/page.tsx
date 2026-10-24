"use client";

import React, { useState, useEffect } from "react";

// --- TYPES ---
type PipelineStage =
  | "Booked"
  | "Shoot Done"
  | "Selection Pending"
  | "In Editing"
  | "Album Lab"
  | "Ready"
  | "Delivered";

type PaymentMode = "UPI / GPay" | "Cash" | "Bank Transfer" | "Cheque";

interface InvoiceItem {
  desc: string;
  qty: number;
  rate: number;
}

interface PaymentLog {
  date: string;
  amount: number;
  mode: PaymentMode;
  note: string;
}

interface Booking {
  id: string;
  docType: "INVOICE" | "ESTIMATE";
  clientName: string;
  phone: string;
  address: string;
  eventType: string;
  eventDate: string;
  venue: string;
  stage: PipelineStage;
  driveLink: string;
  items: InvoiceItem[];
  gstPercent: number;
  discount: number;
  advancePaid: number;
  paymentMode: PaymentMode;
  paymentLogs: PaymentLog[];
  notes: string;
}

interface Expense {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  paidTo: string;
}

interface GearItem {
  id: string;
  name: string;
  category: string;
  status: "In Studio" | "On Shoot" | "In Repair";
  assignedTo: string;
}

// Pre-built Studio Packages for 1-Click Add
const QUICK_PACKAGES = [
  {
    name: "🥉 Silver Wedding Package",
    items: [
      { desc: "Traditional Photography & Videography (1 Day)", qty: 1, rate: 20000 },
      { desc: "Karizma Album (30 Sheets)", qty: 1, rate: 7000 },
    ],
  },
  {
    name: "🥇 Gold Candid + Cinematic",
    items: [
      { desc: "Candid Photography + Cinematic Teaser & Full Film", qty: 1, rate: 45000 },
      { desc: "Drone Aerial Coverage", qty: 1, rate: 6000 },
      { desc: "Premium Acrylic Album (40 Sheets)", qty: 1, rate: 12000 },
    ],
  },
  {
    name: "💑 Pre-Wedding Shoot",
    items: [
      { desc: "Pre-Wedding Candid Photos + 3 Min Cinematic Song", qty: 1, rate: 18000 },
      { desc: "Drone Reel Shoot", qty: 1, rate: 4000 },
    ],
  },
];

export default function SurajStudioBillingERP() {
  // --- AUTH STATE ---
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const SECRET_PIN = "suraj@2026";

  // --- NAVIGATION ---
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "pipeline" | "billing" | "expenses" | "gear" | "settings"
  >("dashboard");

  // --- STUDIO SETTINGS ---
  const [studioName, setStudioName] = useState("SURAJ STUDIO MUHANDRA");
  const [studioTagline, setStudioTagline] = useState(
    "Wedding Photography • Cinematic Films • Drone & Album Lab"
  );
  const [studioPhone, setStudioPhone] = useState("+91 98765 43210");
  const [studioAddress, setStudioAddress] = useState("Main Market, Muhandra, MP");
  const [studioGstin, setStudioGstin] = useState("");
  const [upiId, setUpiId] = useState("surajstudio@upi");
  const [termsText, setTermsText] = useState(
    "1. 50% Advance mandatory for booking confirmation.\n2. Remaining balance to be cleared before raw data/album delivery.\n3. Photo selection must be completed within 15 days of shoot."
  );

  // --- FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("ALL");

  // --- MAIN DATA ---
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [gearList, setGearList] = useState<GearItem[]>([]);

  // --- BILLING FORM STATE ---
  const [editId, setEditId] = useState<string | null>(null);
  const [docType, setDocType] = useState<"INVOICE" | "ESTIMATE">("INVOICE");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [eventType, setEventType] = useState("Wedding Photography & Cinematic");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [stage, setStage] = useState<PipelineStage>("Booked");
  const [driveLink, setDriveLink] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { desc: "Candid Photography + Cinematic Video", qty: 1, rate: 35000 },
    { desc: "Karizma Album (40 Sheets High Gloss)", qty: 1, rate: 10000 },
  ]);
  const [gstPercent, setGstPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(15000);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("UPI / GPay");
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [newInstallmentAmt, setNewInstallmentAmt] = useState("");
  const [newInstallmentNote, setNewInstallmentNote] = useState("");
  const [notes, setNotes] = useState("");

  // --- EXPENSE FORM STATE ---
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState("Album Printing Lab");
  const [expDate, setExpDate] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidTo, setExpPaidTo] = useState("");

  // --- GEAR FORM STATE ---
  const [gearName, setGearName] = useState("");
  const [gearCategory, setGearCategory] = useState("Camera Body");
  const [gearStatus, setGearStatus] = useState<"In Studio" | "On Shoot" | "In Repair">("In Studio");
  const [gearAssignedTo, setGearAssignedTo] = useState("");

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (sessionStorage.getItem("suraj_admin_unlocked") === "true") {
      setIsUnlocked(true);
    }

    const today = new Date().toISOString().split("T")[0];
    setEventDate(today);
    setExpDate(today);

    const savedBookings = localStorage.getItem("suraj_studio_bookings_v2");
    const savedExpenses = localStorage.getItem("suraj_studio_expenses_v2");
    const savedGear = localStorage.getItem("suraj_studio_gear_v2");
    const savedSettings = localStorage.getItem("suraj_studio_settings_v2");

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.studioName) setStudioName(parsed.studioName);
      if (parsed.studioTagline) setStudioTagline(parsed.studioTagline);
      if (parsed.studioPhone) setStudioPhone(parsed.studioPhone);
      if (parsed.studioAddress) setStudioAddress(parsed.studioAddress);
      if (parsed.studioGstin) setStudioGstin(parsed.studioGstin);
      if (parsed.upiId) setUpiId(parsed.upiId);
      if (parsed.termsText) setTermsText(parsed.termsText);
    }

    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      const sample: Booking[] = [
        {
          id: "INV-1001",
          docType: "INVOICE",
          clientName: "Rahul & Priya Wedding",
          phone: "9876543210",
          address: "Muhandra, MP",
          eventType: "Wedding Photography & Cinematic",
          eventDate: today,
          venue: "Royal Palace Garden",
          stage: "In Editing",
          driveLink: "https://drive.google.com/",
          items: [
            { desc: "Full Wedding Candid + Drone + Video", qty: 1, rate: 55000 },
            { desc: "Premium Acrylic Album (45 Sheets)", qty: 1, rate: 12000 },
          ],
          gstPercent: 0,
          discount: 2000,
          advancePaid: 40000,
          paymentMode: "UPI / GPay",
          paymentLogs: [
            { date: today, amount: 20000, mode: "UPI / GPay", note: "Booking Advance" },
            { date: today, amount: 20000, mode: "Cash", note: "Shoot Day Payment" },
          ],
          notes: "Deliver reel within 5 days.",
        },
        {
          id: "EST-2041",
          docType: "ESTIMATE",
          clientName: "Vikram Singh",
          phone: "9123456780",
          address: "Sagar Road",
          eventType: "Pre-Wedding + Engagement",
          eventDate: today,
          venue: "Orchha Fort",
          stage: "Booked",
          driveLink: "",
          items: [{ desc: "Pre-Wedding Cinematic Package + Drone", qty: 1, rate: 28000 }],
          gstPercent: 0,
          discount: 1000,
          advancePaid: 5000,
          paymentMode: "UPI / GPay",
          paymentLogs: [{ date: today, amount: 5000, mode: "UPI / GPay", note: "Token" }],
          notes: "",
        },
      ];
      setBookings(sample);
      localStorage.setItem("suraj_studio_bookings_v2", JSON.stringify(sample));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      const sampleExp: Expense[] = [
        {
          id: "EXP-1",
          title: "Drone Operator Freelancer Payout",
          category: "Freelancer Payout",
          date: today,
          amount: 4500,
          paidTo: "Aman Drone Pilot",
        },
      ];
      setExpenses(sampleExp);
      localStorage.setItem("suraj_studio_expenses_v2", JSON.stringify(sampleExp));
    }

    if (savedGear) {
      setGearList(JSON.parse(savedGear));
    } else {
      const sampleGear: GearItem[] = [
        { id: "G-1", name: "Sony A7M4 + 24-70mm GM", category: "Camera Body", status: "In Studio", assignedTo: "Suraj" },
        { id: "G-2", name: "DJI Air 3 Drone Combo", category: "Drone", status: "On Shoot", assignedTo: "Aman" },
        { id: "G-3", name: "Godox AD200 Pro Flash (x2)", category: "Lighting", status: "In Studio", assignedTo: "Studio" },
      ];
      setGearList(sampleGear);
      localStorage.setItem("suraj_studio_gear_v2", JSON.stringify(sampleGear));
    }
  }, []);

  // --- STORAGE HELPERS ---
  const saveBookingsToStorage = (updated: Booking[]) => {
    setBookings(updated);
    localStorage.setItem("suraj_studio_bookings_v2", JSON.stringify(updated));
  };

  const saveExpensesToStorage = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem("suraj_studio_expenses_v2", JSON.stringify(updated));
  };

  const saveGearToStorage = (updated: GearItem[]) => {
    setGearList(updated);
    localStorage.setItem("suraj_studio_gear_v2", JSON.stringify(updated));
  };

  const saveSettingsToStorage = () => {
    const data = {
      studioName,
      studioTagline,
      studioPhone,
      studioAddress,
      studioGstin,
      upiId,
      termsText,
    };
    localStorage.setItem("suraj_studio_settings_v2", JSON.stringify(data));
    alert("✅ Studio Settings Save ho gayi!");
  };

  // --- CALCULATIONS ---
  const calcBookingTotals = (b: {
    items: InvoiceItem[];
    gstPercent: number;
    discount: number;
    advancePaid: number;
  }) => {
    const subTotal = b.items.reduce(
      (sum, item) => sum + (Number(item.qty) || 0) * (Number(item.rate) || 0),
      0
    );
    const gstAmount = Math.round((subTotal * (Number(b.gstPercent) || 0)) / 100);
    const grandTotal = Math.max(0, subTotal + gstAmount - (Number(b.discount) || 0));
    const balanceDue = Math.max(0, grandTotal - (Number(b.advancePaid) || 0));
    return { subTotal, gstAmount, grandTotal, balanceDue };
  };

  const currentTotals = calcBookingTotals({
    items,
    gstPercent,
    discount,
    advancePaid,
  });

  // Dashboard Metrics
  const invoiceList = bookings.filter((b) => b.docType === "INVOICE");
  const estimateList = bookings.filter((b) => b.docType === "ESTIMATE");
  const totalRevenue = invoiceList.reduce((s, b) => s + calcBookingTotals(b).grandTotal, 0);
  const totalCollected = invoiceList.reduce((s, b) => s + (Number(b.advancePaid) || 0), 0);
  const totalPending = invoiceList.reduce((s, b) => s + calcBookingTotals(b).balanceDue, 0);
  const totalExp = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = totalCollected - totalExp;

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
      sessionStorage.setItem("suraj_admin_unlocked", "true");
      setIsUnlocked(true);
      setAuthError("");
    } else {
      setAuthError("❌ Galat Password! Sirf Suraj Studio Admin hi khol sakte hain.");
      setPin("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("suraj_admin_unlocked");
    setIsUnlocked(false);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return alert("Client ka naam daalna zaroori hai!");

    const prefix = docType === "ESTIMATE" ? "EST" : "INV";
    let id = editId;
    if (!id) {
      id = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    } else if (docType === "INVOICE" && id.startsWith("EST-")) {
      id = id.replace("EST-", "INV-");
    }

    const newRecord: Booking = {
      id,
      docType,
      clientName,
      phone,
      address,
      eventType,
      eventDate,
      venue,
      stage,
      driveLink,
      items,
      gstPercent: Number(gstPercent) || 0,
      discount: Number(discount) || 0,
      advancePaid: Number(advancePaid) || 0,
      paymentMode,
      paymentLogs,
      notes,
    };

    let updated: Booking[];
    if (editId) {
      updated = bookings.map((b) => (b.id === editId ? newRecord : b));
    } else {
      updated = [newRecord, ...bookings];
    }

    saveBookingsToStorage(updated);
    setEditId(id);
    alert(`✅ ${id} Save ho gaya!`);
  };

  const handleLoadBooking = (b: Booking) => {
    setEditId(b.id);
    setDocType(b.docType);
    setClientName(b.clientName);
    setPhone(b.phone);
    setAddress(b.address || "");
    setEventType(b.eventType);
    setEventDate(b.eventDate);
    setVenue(b.venue || "");
    setStage(b.stage);
    setDriveLink(b.driveLink);
    setItems(b.items);
    setGstPercent(b.gstPercent);
    setDiscount(b.discount);
    setAdvancePaid(b.advancePaid);
    setPaymentMode(b.paymentMode || "UPI / GPay");
    setPaymentLogs(b.paymentLogs || []);
    setNotes(b.notes || "");
    setActiveTab("billing");
  };

  const handleConvertEstimateToInvoice = (b: Booking) => {
    const newId = b.id.replace("EST-", "INV-");
    const converted: Booking = {
      ...b,
      id: newId,
      docType: "INVOICE",
    };
    const updated = bookings.map((item) => (item.id === b.id ? converted : item));
    saveBookingsToStorage(updated);
    handleLoadBooking(converted);
    alert(`🎉 Estimate ${b.id} ko Final Tax Invoice (${newId}) mein badal diya gaya!`);
  };

  const handleDeleteBooking = (id: string) => {
    if (!confirm(`Kya aap sach mein ${id} ko delete karna chahte hain?`)) return;
    saveBookingsToStorage(bookings.filter((b) => b.id !== id));
    if (editId === id) handleResetForm();
  };

  const handleAddInstallment = () => {
    const amt = Number(newInstallmentAmt);
    if (!amt || amt <= 0) return;
    const today = new Date().toISOString().split("T")[0];
    const newLog: PaymentLog = {
      date: today,
      amount: amt,
      mode: paymentMode,
      note: newInstallmentNote || "Part Payment",
    };
    const updatedLogs = [...paymentLogs, newLog];
    setPaymentLogs(updatedLogs);
    setAdvancePaid(Number(advancePaid) + amt);
    setNewInstallmentAmt("");
    setNewInstallmentNote("");
  };

  const handleResetForm = () => {
    setEditId(null);
    setDocType("INVOICE");
    setClientName("");
    setPhone("");
    setAddress("");
    setVenue("");
    setDriveLink("");
    setItems([{ desc: "Wedding Photography Package", qty: 1, rate: 25000 }]);
    setGstPercent(0);
    setDiscount(0);
    setAdvancePaid(0);
    setPaymentLogs([]);
    setNotes("");
  };

  const handleWhatsAppShare = (b: Booking) => {
    const t = calcBookingTotals(b);
    const cleanPhone = b.phone.replace(/\D/g, "");
    const num = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;

    const msg =
      `*${studioName}*%0A` +
      `--------------------------%0A` +
      `Namaste *${b.clientName}*,%0A` +
      `Aapke *${b.eventType}* (${b.id}) ki details:%0A%0A` +
      `📅 *Event Date:* ${b.eventDate}%0A` +
      `📌 *Work Status:* ${b.stage}%0A` +
      `💰 *Total Package:* ₹${t.grandTotal.toLocaleString("en-IN")}%0A` +
      `✅ *Paid Amount:* ₹${b.advancePaid.toLocaleString("en-IN")}%0A` +
      `⏳ *Balance Due:* ₹${t.balanceDue.toLocaleString("en-IN")}%0A` +
      (b.driveLink ? `%0A📂 *Photos Drive Link:* ${b.driveLink}%0A` : "") +
      `%0A💳 *UPI Pay:* ${upiId}%0ADhanyawad! 🙏`;

    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
  };

  // Export CSV (CA / Excel)
  const handleExportCSV = () => {
    const headers = [
      "Bill ID",
      "Type",
      "Client Name",
      "Phone",
      "Event",
      "Date",
      "Stage",
      "Total Amount",
      "Advance Paid",
      "Balance Due",
    ];
    const rows = bookings.map((b) => {
      const t = calcBookingTotals(b);
      return [
        b.id,
        b.docType,
        `"${b.clientName}"`,
        b.phone,
        `"${b.eventType}"`,
        b.eventDate,
        b.stage,
        t.grandTotal,
        b.advancePaid,
        t.balanceDue,
      ].join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Suraj_Studio_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;
    const newExp: Expense = {
      id: "EXP-" + Date.now(),
      title: expTitle,
      category: expCategory,
      date: expDate,
      amount: Number(expAmount),
      paidTo: expPaidTo,
    };
    saveExpensesToStorage([newExp, ...expenses]);
    setExpTitle("");
    setExpAmount("");
    setExpPaidTo("");
  };

  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gearName) return;
    const newGear: GearItem = {
      id: "G-" + Date.now(),
      name: gearName,
      category: gearCategory,
      status: gearStatus,
      assignedTo: gearAssignedTo || "Studio",
    };
    saveGearToStorage([newGear, ...gearList]);
    setGearName("");
    setGearAssignedTo("");
  };

  // UPI QR URL
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    studioName
  )}&am=${currentTotals.balanceDue > 0 ? currentTotals.balanceDue : ""}&cu=INR`;
  const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    upiUri
  )}`;

  // --- 1. LOCK SCREEN ---
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-white">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              📸
            </div>
            <h1 className="text-xl font-bold">{studioName}</h1>
            <p className="text-xs text-zinc-400 mt-1">Private Admin Billing & Studio ERP</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Secret Admin Password</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Password daalein..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl text-sm transition"
            >
              🔓 Unlock Studio ERP
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. MAIN STUDIO ERP ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-5 flex flex-col justify-between print:hidden">
        <div>
          <div className="flex items-center gap-3 pb-5 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-lg">
              📸
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">{studioName}</h1>
              <p className="text-[11px] text-amber-400">Complete Studio ERP</p>
            </div>
          </div>

          <nav className="mt-5 flex md:flex-col gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "dashboard"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              📊 Dashboard & Reports
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "pipeline"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              🎬 Shoots & Delivery Pipeline
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "billing"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              🧾 Invoice & Quotation Builder
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "expenses"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              💸 Expenses & Lab Payouts
            </button>
            <button
              onClick={() => setActiveTab("gear")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "gear"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              🎥 Camera & Gear Inventory
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "settings"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              ⚙️ Studio Settings & UPI
            </button>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 space-y-2 hidden md:block">
          <button
            onClick={handleExportCSV}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2 rounded-lg text-xs font-semibold transition"
          >
            📥 Export Excel (CSV)
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2 rounded-lg text-xs font-semibold transition"
          >
            🔒 Lock Admin ERP
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Studio Financial Overview</h2>
                <p className="text-xs text-zinc-400">
                  Total Billed, Market Vasooli, Quotations aur Asli Munafa
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  📥 Download Excel
                </button>
                <button
                  onClick={() => {
                    handleResetForm();
                    setActiveTab("billing");
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  + Naya Bill / Estimate
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Total Billed ({invoiceList.length} Invoices)</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Cash/UPI Received: ₹{totalCollected.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Market Pending (Vasooli)</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                  ₹{totalPending.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                   Open Quotations: {estimateList.length}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Studio Kharcha (Expenses)</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">
                  ₹{totalExp.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">Album Lab & Freelancers</p>
              </div>

              <div className="bg-zinc-900 border border-emerald-900/50 p-5 rounded-2xl">
                <p className="text-xs text-emerald-400 font-semibold">Net Cash Profit (Bachat)</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  ₹{netProfit.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">Collected minus Expenses</p>
              </div>
            </div>

            {/* All Bookings & Quotations Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="font-bold text-sm">All Invoices & Quotations</h3>
                <input
                  type="text"
                  placeholder="Search client ya phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="pb-3">ID / Type</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Event & Date</th>
                      <th className="pb-3">Stage</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Paid</th>
                      <th className="pb-3">Balance Due</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {bookings
                      .filter(
                        (b) =>
                          b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.phone.includes(searchQuery) ||
                          b.id.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((b) => {
                        const t = calcBookingTotals(b);
                        return (
                          <tr key={b.id} className="hover:bg-zinc-800/40">
                            <td className="py-3 font-mono">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  b.docType === "ESTIMATE"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {b.id}
                              </span>
                            </td>
                            <td className="py-3 font-semibold">
                              {b.clientName}
                              <div className="text-[11px] text-zinc-500">📞 {b.phone}</div>
                            </td>
                            <td className="py-3">
                              {b.eventType}
                              <div className="text-[11px] text-zinc-500">📅 {b.eventDate}</div>
                            </td>
                            <td className="py-3">
                              <span className="bg-zinc-800 px-2.5 py-1 rounded-full text-[11px]">
                                {b.stage}
                              </span>
                            </td>
                            <td className="py-3 font-semibold">
                              ₹{t.grandTotal.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 text-emerald-400">
                              ₹{b.advancePaid.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 font-bold text-amber-400">
                              ₹{t.balanceDue.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 text-right space-x-1.5">
                              {b.docType === "ESTIMATE" && (
                                <button
                                  onClick={() => handleConvertEstimateToInvoice(b)}
                                  className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-600 hover:text-white transition"
                                  title="Convert Estimate to Final Invoice"
                                >
                                  Convert to Bill
                                </button>
                              )}
                              <button
                                onClick={() => handleWhatsAppShare(b)}
                                className="bg-emerald-600/20 text-emerald-400 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition"
                              >
                                WhatsApp
                              </button>
                              <button
                                onClick={() => handleLoadBooking(b)}
                                className="bg-zinc-800 text-zinc-200 px-2.5 py-1 rounded-lg hover:bg-zinc-700"
                              >
                                Edit / Print
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.id)}
                                className="text-rose-400 hover:text-rose-300 px-1.5"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOOTS & DELIVERY PIPELINE */}
        {activeTab === "pipeline" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Shoots & Album Delivery Pipeline</h2>
                <p className="text-xs text-zinc-400">
                  Har wedding aur shoot ka live editing/album status aur Google Drive link
                </p>
              </div>
              <div className="flex gap-2">
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="ALL">All Stages ({bookings.length})</option>
                  <option value="Booked">📅 Booked</option>
                  <option value="Shoot Done">🎥 Shoot Done</option>
                  <option value="Selection Pending">👀 Selection Pending</option>
                  <option value="In Editing">💻 In Editing</option>
                  <option value="Album Lab">🖨️ Album Lab</option>
                  <option value="Ready">✅ Ready</option>
                  <option value="Delivered">🎉 Delivered</option>
                </select>
                <input
                  type="text"
                  placeholder="Search client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {bookings
                .filter((b) => stageFilter === "ALL" || b.stage === stageFilter)
                .filter(
                  (b) =>
                    b.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    b.phone.includes(searchQuery)
                )
                .map((b) => {
                  const t = calcBookingTotals(b);
                  return (
                    <div
                      key={b.id}
                      className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-amber-400 font-bold">
                            {b.id}
                          </span>
                          <span className="text-xs text-zinc-400">• 📅 {b.eventDate}</span>
                          {b.venue && (
                            <span className="text-xs text-zinc-400">• 📍 {b.venue}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-base">{b.clientName}</h3>
                        <p className="text-xs text-zinc-400">
                          {b.eventType} • 📞 {b.phone}
                        </p>
                        {b.driveLink && (
                          <a
                            href={b.driveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block text-xs text-sky-400 hover:underline pt-1"
                          >
                            📂 Open Client Google Drive Folder ↗
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1">
                            Work Stage
                          </label>
                          <select
                            value={b.stage}
                            onChange={(e) => {
                              const updated = bookings.map((item) =>
                                item.id === b.id
                                  ? { ...item, stage: e.target.value as PipelineStage }
                                  : item
                              );
                              saveBookingsToStorage(updated);
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-semibold"
                          >
                            <option value="Booked">📅 Booked</option>
                            <option value="Shoot Done">🎥 Shoot Done</option>
                            <option value="Selection Pending">👀 Photo Selection Pending</option>
                            <option value="In Editing">💻 In Editing</option>
                            <option value="Album Lab">🖨️ Sent to Album Lab</option>
                            <option value="Ready">✅ Ready for Delivery</option>
                            <option value="Delivered">🎉 Delivered</option>
                          </select>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-zinc-400">Balance Due</p>
                          <p className="text-sm font-bold text-amber-400">
                            ₹{t.balanceDue.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          onClick={() => handleWhatsAppShare(b)}
                          className="bg-emerald-600/20 text-emerald-400 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-600 hover:text-white"
                        >
                          WhatsApp Status
                        </button>

                        <button
                          onClick={() => handleLoadBooking(b)}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                        >
                          Bill Kholein
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: BILLING & QUOTATION BUILDER */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Form (Hidden on Print) */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {editId ? `Editing ${editId}` : "Naya Invoice / Quotation"}
                </h3>
                <button
                  onClick={handleResetForm}
                  className="text-xs bg-zinc-800 px-2.5 py-1 rounded-lg text-zinc-300 hover:text-white"
                >
                  + New Blank Bill
                </button>
              </div>

              {/* 1-Click Package Presets */}
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1.5">
                  ⚡ 1-Click Ready Packages:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PACKAGES.map((pkg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setItems(pkg.items)}
                      className="bg-zinc-950 border border-zinc-800 hover:border-amber-500 text-[11px] px-2.5 py-1 rounded-lg text-zinc-300 transition"
                    >
                      {pkg.name}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveBooking} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as "INVOICE" | "ESTIMATE")}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-amber-400"
                  >
                    <option value="INVOICE">🧾 TAX INVOICE</option>
                    <option value="ESTIMATE">📝 QUOTATION / ESTIMATE</option>
                  </select>

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Client ka Naam *"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp Number *"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Event (e.g. Wedding Shoot)"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Venue / Village (e.g. Muhandra)"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as PipelineStage)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Booked">Stage: Booked</option>
                    <option value="Shoot Done">Stage: Shoot Done</option>
                    <option value="Selection Pending">Stage: Selection Pending</option>
                    <option value="In Editing">Stage: In Editing</option>
                    <option value="Album Lab">Stage: Album Lab</option>
                    <option value="Ready">Stage: Ready</option>
                    <option value="Delivered">Stage: Delivered</option>
                  </select>

                  <input
                    type="url"
                    placeholder="Google Drive Link (Optional)"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {/* Items List */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400">
                      Package Services & Deliverables
                    </span>
                    <button
                      type="button"
                      onClick={() => setItems([...items, { desc: "", qty: 1, rate: 5000 }])}
                      className="text-xs text-amber-400 font-semibold"
                    >
                      + Add Line Item
                    </button>
                  </div>

                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5">
                      <input
                        type="text"
                        placeholder="Description"
                        value={it.desc}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].desc = e.target.value;
                          setItems(copy);
                        }}
                        className="col-span-6 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs"
                      />
                      <input
                        type="number"
                        value={it.qty}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].qty = Number(e.target.value);
                          setItems(copy);
                        }}
                        className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center"
                      />
                      <input
                        type="number"
                        value={it.rate}
                        onChange={(e) => {
                          const copy = [...items];
                          copy[idx].rate = Number(e.target.value);
                          setItems(copy);
                        }}
                        className="col-span-3 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="col-span-1 text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Taxes, Discount & Advance */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800">
                  <div>
                    <label className="text-[10px] text-zinc-400">GST %</label>
                    <input
                      type="number"
                      value={gstPercent}
                      onChange={(e) => setGstPercent(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400">Discount (₹)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-400 font-bold">
                      Total Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-emerald-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                {/* Installment (Part-Payment) Adder */}
                <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block">
                    ➕ Add Part-Payment / Installment Record
                  </span>
                  <div className="grid grid-cols-12 gap-1.5">
                    <input
                      type="number"
                      placeholder="₹ Amount"
                      value={newInstallmentAmt}
                      onChange={(e) => setNewInstallmentAmt(e.target.value)}
                      className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                      className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    >
                      <option value="UPI / GPay">UPI / GPay</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Note (e.g. Shoot day)"
                      value={newInstallmentNote}
                      onChange={(e) => setNewInstallmentNote(e.target.value)}
                      className="col-span-4 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInstallment}
                    className="w-full bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white py-1 rounded-lg text-xs font-semibold transition"
                  >
                    + Add to Paid Amount
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Special Note (e.g. 2 Acrylic Frames Complimentary)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                />

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs"
                  >
                    💾 Save Record
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    🖨️ Print / Save PDF
                  </button>
                </div>
              </form>
            </div>

            {/* Right Live A4 Printable Invoice */}
            <div className="lg:col-span-7 bg-white text-zinc-900 p-8 rounded-2xl shadow-2xl print:shadow-none print:p-0">
              <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5">
                <div>
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                    {docType === "ESTIMATE" ? "QUOTATION / ESTIMATE" : "TAX INVOICE"}
                  </span>
                  <h1 className="text-2xl font-extrabold mt-2 tracking-tight">
                    {studioName}
                  </h1>
                  <p className="text-xs text-zinc-600">{studioTagline}</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    📍 {studioAddress} • 📞 {studioPhone}
                  </p>
                  {studioGstin && (
                    <p className="text-[11px] font-semibold text-zinc-700">
                      GSTIN: {studioGstin}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Document No.</p>
                  <p className="text-lg font-bold font-mono">{editId || "NEW-DRAFT"}</p>
                  <p className="text-xs text-zinc-600 mt-1">Event Date: {eventDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5 bg-zinc-100 p-4 rounded-xl text-xs">
                <div>
                  <p className="text-zinc-500 font-semibold">CLIENT DETAILS:</p>
                  <p className="font-bold text-sm mt-0.5">{clientName || "Walk-in Client"}</p>
                  <p className="text-zinc-700">Phone: {phone || "-"}</p>
                  {venue && <p className="text-zinc-700">Venue: {venue}</p>}
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 font-semibold">EVENT & STATUS:</p>
                  <p className="font-bold text-sm mt-0.5">{eventType}</p>
                  <p className="text-amber-700 font-semibold">Stage: {stage}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs mb-5">
                <thead>
                  <tr className="border-b-2 border-zinc-300 text-zinc-600">
                    <th className="py-2">#</th>
                    <th className="py-2">Service / Package Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5">{i + 1}</td>
                      <td className="py-2.5 font-semibold">{it.desc}</td>
                      <td className="py-2.5 text-center">{it.qty}</td>
                      <td className="py-2.5 text-right">
                        ₹{Number(it.rate).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 text-right font-bold">
                        ₹{(it.qty * it.rate).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Payment History Log on Invoice */}
              {paymentLogs.length > 0 && (
                <div className="mb-5 bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-[11px]">
                  <p className="font-bold text-zinc-700 mb-1">Payment Installments Received:</p>
                  <div className="flex flex-wrap gap-2">
                    {paymentLogs.map((log, index) => (
                      <span
                        key={index}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded"
                      >
                        {log.date}: ₹{log.amount.toLocaleString("en-IN")} ({log.mode} - {log.note})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {notes && (
                <p className="text-xs italic text-zinc-600 mb-4">
                  <strong>Note:</strong> {notes}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center border-t-2 border-zinc-900 pt-5">
                <div className="flex items-center gap-3 bg-zinc-100 p-3 rounded-xl">
                  <img
                    src={qrCodeImg}
                    alt="UPI QR"
                    className="w-20 h-20 rounded border bg-white p-1"
                  />
                  <div className="text-[11px]">
                    <p className="font-bold text-zinc-900">Scan to Pay via UPI</p>
                    <p className="text-zinc-600">{upiId}</p>
                    <p className="text-zinc-500 mt-1 whitespace-pre-line text-[10px]">
                      {termsText}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Subtotal:</span>
                    <span className="font-semibold">
                      ₹{currentTotals.subTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">GST ({gstPercent}%):</span>
                    <span>₹{currentTotals.gstAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Discount:</span>
                    <span className="text-rose-600">
                      - ₹{Number(discount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold border-t border-zinc-300 pt-1.5">
                    <span>Grand Total:</span>
                    <span>₹{currentTotals.grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Total Paid:</span>
                    <span>₹{Number(advancePaid).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between bg-amber-100 text-amber-900 p-2 rounded-lg font-extrabold text-sm">
                    <span>BALANCE DUE:</span>
                    <span>₹{currentTotals.balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDIO EXPENSES */}
        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-fit">
              <h3 className="font-bold text-base mb-4">Add Studio / Lab Expense</h3>
              <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Expense Title (e.g. Priya Wedding Album Print)"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                  required
                />
                <input
                  type="text"
                  placeholder="Paid To (e.g. Color Lab Sagar / Drone Pilot)"
                  value={expPaidTo}
                  onChange={(e) => setExpPaidTo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                />
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                >
                  <option value="Album Printing Lab">Album Printing Lab</option>
                  <option value="Freelancer Payout">Drone / Candid Freelancer Payout</option>
                  <option value="Video Editor Payout">Video Editor Payout</option>
                  <option value="Camera & Gear Repair">Camera & Gear Maintenance</option>
                  <option value="Studio Rent & Bill">Studio Rent & Electricity</option>
                </select>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5 rounded-xl"
                >
                  + Record Expense
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <h3 className="font-bold text-base mb-4">Expense & Payout History</h3>
              <div className="space-y-2 text-xs">
                {expenses.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between bg-zinc-950 p-3.5 rounded-xl border border-zinc-800"
                  >
                    <div>
                      <p className="font-bold text-sm">{ex.title}</p>
                      <p className="text-zinc-400">
                        {ex.category} {ex.paidTo ? `• Paid to: ${ex.paidTo}` : ""} • 📅 {ex.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-rose-400 text-sm">
                        - ₹{ex.amount.toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() =>
                          saveExpensesToStorage(expenses.filter((i) => i.id !== ex.id))
                        }
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAMERA & GEAR INVENTORY */}
        {activeTab === "gear" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-fit">
              <h3 className="font-bold text-base mb-4">Add Studio Camera / Gear</h3>
              <form onSubmit={handleAddGear} className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Gear Name (e.g. Sony A7M4 / DJI Ronin)"
                  value={gearName}
                  onChange={(e) => setGearName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                  required
                />
                <select
                  value={gearCategory}
                  onChange={(e) => setGearCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                >
                  <option value="Camera Body">Camera Body</option>
                  <option value="Lens">Prime / Zoom Lens</option>
                  <option value="Drone">Drone</option>
                  <option value="Gimbal & Audio">Gimbal & Mic</option>
                  <option value="Lighting">Flash & Video Lights</option>
                </select>
                <input
                  type="text"
                  placeholder="Kiske paas hai? (e.g. Suraj / Studio Locker)"
                  value={gearAssignedTo}
                  onChange={(e) => setGearAssignedTo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl"
                >
                  + Add Gear to Inventory
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <h3 className="font-bold text-base mb-4">Studio Equipment Tracker</h3>
              <div className="space-y-2 text-xs">
                {gearList.map((g) => (
                  <div
                    key={g.id}
                    className="flex flex-wrap items-center justify-between bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 gap-3"
                  >
                    <div>
                      <p className="font-bold text-sm">{g.name}</p>
                      <p className="text-zinc-400">
                        {g.category} • Holder: {g.assignedTo}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={g.status}
                        onChange={(e) => {
                          const updated = gearList.map((item) =>
                            item.id === g.id
                              ? { ...item, status: e.target.value as GearItem["status"] }
                              : item
                          );
                          saveGearToStorage(updated);
                        }}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-400"
                      >
                        <option value="In Studio">🏠 In Studio</option>
                        <option value="On Shoot">🎥 Out on Shoot</option>
                        <option value="In Repair">🔧 In Repair</option>
                      </select>
                      <button
                        onClick={() =>
                          saveGearToStorage(gearList.filter((i) => i.id !== g.id))
                        }
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: STUDIO SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base">Studio Bill Header & UPI Settings</h3>
            <div>
              <label className="text-zinc-400 block mb-1">Studio Name</label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Tagline / Services</label>
              <input
                type="text"
                value={studioTagline}
                onChange={(e) => setStudioTagline(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Studio Phone</label>
                <input
                  type="text"
                  value={studioPhone}
                  onChange={(e) => setStudioPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">UPI ID (QR Code ke liye)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-zinc-950 border border-amber-600 rounded-xl px-3 py-2 text-amber-400 font-bold"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-400 block mb-1">Studio Address</label>
                <input
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={studioGstin}
                  onChange={(e) => setStudioGstin(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Bill Terms & Conditions</label>
              <textarea
                rows={3}
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2"
              />
            </div>
            <button
              onClick={saveSettingsToStorage}
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl"
            >
              💾 Save Studio Settings
            </button>
          </div>
        )}
      </main>
    </div>
  );
}