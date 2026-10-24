"use client";

import React, { useState, useEffect } from "react";

// Types
type PipelineStage =
  | "Booked"
  | "Shoot Done"
  | "Selection Pending"
  | "In Editing"
  | "Album Lab"
  | "Ready"
  | "Delivered";

interface InvoiceItem {
  desc: string;
  qty: number;
  rate: number;
}

interface Booking {
  id: string;
  docType: "INVOICE" | "ESTIMATE";
  clientName: string;
  phone: string;
  eventType: string;
  eventDate: string;
  stage: PipelineStage;
  driveLink: string;
  items: InvoiceItem[];
  gstPercent: number;
  discount: number;
  advancePaid: number;
}

interface Expense {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
}

export default function SurajStudioBillingERP() {
  // Auth State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const SECRET_PIN = "suraj@2026"; // Apna secret password yahan badal sakte hain

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "pipeline" | "billing" | "expenses"
  >("dashboard");

  // Studio Settings
  const [upiId, setUpiId] = useState("surajstudio@upi");
  const [searchQuery, setSearchQuery] = useState("");

  // Main Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Form States for Invoice / Booking
  const [editId, setEditId] = useState<string | null>(null);
  const [docType, setDocType] = useState<"INVOICE" | "ESTIMATE">("INVOICE");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventType, setEventType] = useState("Wedding Photography & Cinematic");
  const [eventDate, setEventDate] = useState("");
  const [stage, setStage] = useState<PipelineStage>("Booked");
  const [driveLink, setDriveLink] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { desc: "Candid Photography + Cinematic Video", qty: 1, rate: 35000 },
    { desc: "Karizma Album (40 Sheets High Gloss)", qty: 1, rate: 10000 },
  ]);
  const [gstPercent, setGstPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(15000);

  // Expense Form State
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState("Album Printing Lab");
  const [expDate, setExpDate] = useState("");
  const [expAmount, setExpAmount] = useState("");

  // Load initial data from LocalStorage
  useEffect(() => {
    if (sessionStorage.getItem("suraj_admin_unlocked") === "true") {
      setIsUnlocked(true);
    }

    const today = new Date().toISOString().split("T")[0];
    setEventDate(today);
    setExpDate(today);

    const savedBookings = localStorage.getItem("suraj_studio_bookings_v1");
    const savedExpenses = localStorage.getItem("suraj_studio_expenses_v1");
    const savedUpi = localStorage.getItem("suraj_studio_upi_v1");

    if (savedUpi) setUpiId(savedUpi);

    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      const sample: Booking[] = [
        {
          id: "INV-1001",
          docType: "INVOICE",
          clientName: "Rahul & Priya Wedding",
          phone: "9876543210",
          eventType: "Wedding Photography & Cinematic",
          eventDate: today,
          stage: "In Editing",
          driveLink: "https://drive.google.com/",
          items: [
            { desc: "Full Wedding Candid + Drone + Video", qty: 1, rate: 55000 },
            { desc: "Premium Acrylic Album (45 Sheets)", qty: 1, rate: 12000 },
          ],
          gstPercent: 0,
          discount: 2000,
          advancePaid: 40000,
        },
      ];
      setBookings(sample);
      localStorage.setItem("suraj_studio_bookings_v1", JSON.stringify(sample));
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
        },
      ];
      setExpenses(sampleExp);
      localStorage.setItem(
        "suraj_studio_expenses_v1",
        JSON.stringify(sampleExp)
      );
    }
  }, []);

  // Save Helpers
  const saveBookingsToStorage = (updated: Booking[]) => {
    setBookings(updated);
    localStorage.setItem("suraj_studio_bookings_v1", JSON.stringify(updated));
  };

  const saveExpensesToStorage = (updated: Expense[]) => {
    setExpenses(updated);
    localStorage.setItem("suraj_studio_expenses_v1", JSON.stringify(updated));
  };

  // Calculations Helper
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
    const grandTotal = Math.max(
      0,
      subTotal + gstAmount - (Number(b.discount) || 0)
    );
    const balanceDue = Math.max(0, grandTotal - (Number(b.advancePaid) || 0));
    return { subTotal, gstAmount, grandTotal, balanceDue };
  };

  // Current Form Totals
  const currentTotals = calcBookingTotals({
    items,
    gstPercent,
    discount,
    advancePaid,
  });

  // Dashboard Metrics
  const invoiceList = bookings.filter((b) => b.docType === "INVOICE");
  const totalRevenue = invoiceList.reduce(
    (s, b) => s + calcBookingTotals(b).grandTotal,
    0
  );
  const totalCollected = invoiceList.reduce(
    (s, b) => s + (Number(b.advancePaid) || 0),
    0
  );
  const totalPending = invoiceList.reduce(
    (s, b) => s + calcBookingTotals(b).balanceDue,
    0
  );
  const totalExp = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const netProfit = totalCollected - totalExp;

  // Auth Handler
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

  // Save Booking / Invoice
  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return alert("Client ka naam daalna zaroori hai!");

    const id =
      editId ||
      `${docType === "ESTIMATE" ? "EST" : "INV"}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    const newRecord: Booking = {
      id,
      docType,
      clientName,
      phone,
      eventType,
      eventDate,
      stage,
      driveLink,
      items,
      gstPercent: Number(gstPercent) || 0,
      discount: Number(discount) || 0,
      advancePaid: Number(advancePaid) || 0,
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
    setEventType(b.eventType);
    setEventDate(b.eventDate);
    setStage(b.stage);
    setDriveLink(b.driveLink);
    setItems(b.items);
    setGstPercent(b.gstPercent);
    setDiscount(b.discount);
    setAdvancePaid(b.advancePaid);
    setActiveTab("billing");
  };

  const handleResetForm = () => {
    setEditId(null);
    setDocType("INVOICE");
    setClientName("");
    setPhone("");
    setDriveLink("");
    setItems([{ desc: "Wedding Photography Package", qty: 1, rate: 25000 }]);
    setGstPercent(0);
    setDiscount(0);
    setAdvancePaid(0);
  };

  const handleWhatsAppShare = (b: Booking) => {
    const t = calcBookingTotals(b);
    const cleanPhone = b.phone.replace(/\D/g, "");
    const num = cleanPhone.length === 10 ? "91" + cleanPhone : cleanPhone;

    const msg =
      `*SURAJ STUDIO MUHANDRA*%0A` +
      `--------------------------%0A` +
      `Namaste *${b.clientName}*,%0A` +
      `Aapke *${b.eventType}* (${b.id}) ka bill details:%0A%0A` +
      `📌 *Work Status:* ${b.stage}%0A` +
      `💰 *Total Package:* ₹${t.grandTotal.toLocaleString("en-IN")}%0A` +
      `✅ *Advance Paid:* ₹${b.advancePaid.toLocaleString("en-IN")}%0A` +
      `⏳ *Balance Due:* ₹${t.balanceDue.toLocaleString("en-IN")}%0A` +
      (b.driveLink ? `%0A📂 *Photos Drive Link:* ${b.driveLink}%0A` : "") +
      `%0ADhanyawad! 🙏`;

    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
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
    };
    saveExpensesToStorage([newExp, ...expenses]);
    setExpTitle("");
    setExpAmount("");
  };

  // UPI QR URL
  const upiUri = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent("Suraj Studio Muhandra")}&am=${
    currentTotals.balanceDue > 0 ? currentTotals.balanceDue : ""
  }&cu=INR`;
  const qrCodeImg = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
    upiUri
  )}`;

  // 1. LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 text-white">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              📸
            </div>
            <h1 className="text-xl font-bold">Suraj Studio Muhandra</h1>
            <p className="text-xs text-zinc-400 mt-1">
              Private Admin Billing & Studio ERP
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Secret Admin Password
              </label>
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

  // 2. MAIN STUDIO ERP
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar (Hidden on Print) */}
      <aside className="w-full md:w-64 bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800 p-5 flex flex-col justify-between print:hidden">
        <div>
          <div className="flex items-center justify-between md:justify-start gap-3 pb-5 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-lg">
              📸
            </div>
            <div>
              <h1 className="font-bold text-base text-white">Suraj Studio</h1>
              <p className="text-xs text-amber-400">Muhandra • Admin ERP</p>
            </div>
          </div>

          <nav className="mt-6 flex md:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "dashboard"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "pipeline"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              🎬 Shoots & Pipeline
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "billing"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              🧾 Create Bill / Quote
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                activeTab === "expenses"
                  ? "bg-amber-600 text-white"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              💸 Studio Expenses
            </button>
          </nav>
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 space-y-3 hidden md:block">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">
              Studio UPI ID (QR Code ke liye)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => {
                setUpiId(e.target.value);
                localStorage.setItem("suraj_studio_upi_v1", e.target.value);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2 rounded-lg text-xs font-semibold transition"
          >
            🔒 Lock Admin ERP
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 overflow-y-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Suraj Studio Overview</h2>
                <p className="text-xs text-zinc-400">
                  Kamai, Pending Payment aur Shoots ka poora hisaab
                </p>
              </div>
              <button
                onClick={() => {
                  handleResetForm();
                  setActiveTab("billing");
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
              >
                + Naya Bill Banayein
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Total Billed Revenue</p>
                <h3 className="text-2xl font-bold mt-1">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-emerald-400 mt-1">
                  Received: ₹{totalCollected.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Market Pending (Vasooli)</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                  ₹{totalPending.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Clients se aane baaki
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
                <p className="text-xs text-zinc-400">Studio Kharcha (Expenses)</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">
                  ₹{totalExp.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Album Lab & Freelancers
                </p>
              </div>

              <div className="bg-zinc-900 border border-emerald-900/50 p-5 rounded-2xl">
                <p className="text-xs text-emerald-400 font-semibold">
                  Asli Munafa (Net Cash Profit)
                </p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  ₹{netProfit.toLocaleString("en-IN")}
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Collected minus Expenses
                </p>
              </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-sm mb-4">Recent Studio Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-zinc-400 border-b border-zinc-800">
                    <tr>
                      <th className="pb-3">Bill ID</th>
                      <th className="pb-3">Client</th>
                      <th className="pb-3">Event Date</th>
                      <th className="pb-3">Work Stage</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Balance Due</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {bookings.map((b) => {
                      const t = calcBookingTotals(b);
                      return (
                        <tr key={b.id} className="hover:bg-zinc-800/40">
                          <td className="py-3 font-mono text-amber-400">
                            {b.id}
                          </td>
                          <td className="py-3 font-semibold">
                            {b.clientName}
                            <div className="text-[11px] text-zinc-500">
                              {b.phone}
                            </div>
                          </td>
                          <td className="py-3">{b.eventDate}</td>
                          <td className="py-3">
                            <span className="bg-zinc-800 px-2.5 py-1 rounded-full text-[11px]">
                              {b.stage}
                            </span>
                          </td>
                          <td className="py-3 font-semibold">
                            ₹{t.grandTotal.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 font-bold text-amber-400">
                            ₹{t.balanceDue.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 text-right space-x-2">
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

        {/* TAB 2: PIPELINE */}
        {activeTab === "pipeline" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-bold">
                Shoots & Album Delivery Tracker
              </h2>
              <input
                type="text"
                placeholder="Client ya phone search karein..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs w-64"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {bookings
                .filter(
                  (b) =>
                    b.clientName
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    b.phone.includes(searchQuery)
                )
                .map((b) => {
                  const t = calcBookingTotals(b);
                  return (
                    <div
                      key={b.id}
                      className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-xs font-mono text-amber-400">
                          {b.id} • {b.eventDate}
                        </span>
                        <h3 className="font-bold text-base">{b.clientName}</h3>
                        <p className="text-xs text-zinc-400">
                          {b.eventType} • 📞 {b.phone}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 block mb-1">
                            Update Work Stage
                          </label>
                          <select
                            value={b.stage}
                            onChange={(e) => {
                              const updated = bookings.map((item) =>
                                item.id === b.id
                                  ? {
                                      ...item,
                                      stage: e.target.value as PipelineStage,
                                    }
                                  : item
                              );
                              saveBookingsToStorage(updated);
                            }}
                            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-semibold"
                          >
                            <option value="Booked">📅 Booked</option>
                            <option value="Shoot Done">🎥 Shoot Done</option>
                            <option value="Selection Pending">
                              👀 Photo Selection Pending
                            </option>
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

        {/* TAB 3: BILLING & INVOICE */}
        {activeTab === "billing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Side (Hidden when printing) */}
            <div className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">
                  {editId ? `Edit ${editId}` : "Naya Bill / Estimate"}
                </h3>
                <button
                  onClick={handleResetForm}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Reset Form
                </button>
              </div>

              <form onSubmit={handleSaveBooking} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={docType}
                    onChange={(e) =>
                      setDocType(e.target.value as "INVOICE" | "ESTIMATE")
                    }
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="INVOICE">TAX INVOICE</option>
                    <option value="ESTIMATE">QUOTATION / ESTIMATE</option>
                  </select>

                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Client ka Naam (e.g. Amit Kumar)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  required
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Event (e.g. Wedding Shoot)"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <input
                  type="url"
                  placeholder="Google Drive / Photos Link (Optional)"
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs"
                />

                {/* Package Items */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-zinc-400">
                      Services & Items
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setItems([...items, { desc: "", qty: 1, rate: 5000 }])
                      }
                      className="text-xs text-amber-400 font-semibold"
                    >
                      + Add Item
                    </button>
                  </div>

                  {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-1.5">
                      <input
                        type="text"
                        placeholder="Item description"
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
                        onClick={() =>
                          setItems(items.filter((_, i) => i !== idx))
                        }
                        className="col-span-1 text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

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
                    <label className="text-[10px] text-zinc-400">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-emerald-400 font-bold">
                      Advance Paid (₹)
                    </label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-emerald-700 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 rounded-xl text-xs"
                  >
                    💾 Save Bill
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    🖨️ Print / PDF
                  </button>
                </div>
              </form>
            </div>

            {/* Live Printable A4 Bill Preview */}
            <div className="lg:col-span-7 bg-white text-zinc-900 p-8 rounded-2xl shadow-2xl print:shadow-none print:p-0">
              <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5">
                <div>
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded uppercase">
                    {docType}
                  </span>
                  <h1 className="text-2xl font-extrabold mt-2 tracking-tight">
                    SURAJ STUDIO MUHANDRA
                  </h1>
                  <p className="text-xs text-zinc-600">
                    Wedding Photography • Cinematic Films • Drone & Album Lab
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Bill No.</p>
                  <p className="text-lg font-bold font-mono">
                    {editId || "NEW-DRAFT"}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">Date: {eventDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5 bg-zinc-100 p-4 rounded-xl text-xs">
                <div>
                  <p className="text-zinc-500 font-semibold">BILL TO:</p>
                  <p className="font-bold text-sm mt-0.5">
                    {clientName || "Client Name"}
                  </p>
                  <p className="text-zinc-700">Phone: {phone || "-"}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500 font-semibold">EVENT DETAILS:</p>
                  <p className="font-bold text-sm mt-0.5">{eventType}</p>
                  <p className="text-amber-700 font-semibold">
                    Status: {stage}
                  </p>
                </div>
              </div>

              <table className="w-full text-left text-xs mb-6">
                <thead>
                  <tr className="border-b-2 border-zinc-300 text-zinc-600">
                    <th className="py-2">#</th>
                    <th className="py-2">Description</th>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center border-t-2 border-zinc-900 pt-5">
                <div className="flex items-center gap-3 bg-zinc-100 p-3 rounded-xl">
                  <img
                    src={qrCodeImg}
                    alt="UPI QR"
                    className="w-20 h-20 rounded border bg-white p-1"
                  />
                  <div className="text-[11px]">
                    <p className="font-bold text-zinc-900">
                      Scan & Pay Balance
                    </p>
                    <p className="text-zinc-600">UPI: {upiId}</p>
                    <p className="text-zinc-500 mt-1">
                      50% advance mandatory for slot confirmation.
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
                    <span>
                      ₹{currentTotals.gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Discount:</span>
                    <span className="text-rose-600">
                      - ₹{Number(discount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold border-t border-zinc-300 pt-1.5">
                    <span>Grand Total:</span>
                    <span>
                      ₹{currentTotals.grandTotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Advance Paid:</span>
                    <span>
                      ₹{Number(advancePaid).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between bg-amber-100 text-amber-900 p-2 rounded-lg font-extrabold text-sm">
                    <span>BALANCE DUE:</span>
                    <span>
                      ₹{currentTotals.balanceDue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXPENSES */}
        {activeTab === "expenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl h-fit">
              <h3 className="font-bold text-base mb-4">Add Studio Kharcha</h3>
              <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                <input
                  type="text"
                  placeholder="Kharcha kis cheez ka? (e.g. Karizma Album Print)"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                  required
                />
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5"
                >
                  <option value="Album Printing Lab">Album Printing Lab</option>
                  <option value="Freelancer Payout">
                    Drone / Candid Freelancer Payout
                  </option>
                  <option value="Camera & Gear Repair">
                    Camera & Gear Maintenance
                  </option>
                  <option value="Studio Rent & Bill">
                    Studio Rent & Electricity
                  </option>
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
                  + Add Expense
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">
              <h3 className="font-bold text-base mb-4">Expense History</h3>
              <div className="space-y-2 text-xs">
                {expenses.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800"
                  >
                    <div>
                      <p className="font-bold text-sm">{ex.title}</p>
                      <p className="text-zinc-400">
                        {ex.category} • {ex.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-rose-400 text-sm">
                        - ₹{ex.amount.toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() =>
                          saveExpensesToStorage(
                            expenses.filter((i) => i.id !== ex.id)
                          )
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
      </main>
    </div>
  );
}