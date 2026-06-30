import { useParams } from 'react-router-dom'
import { useExpertApplicationView } from '../../hooks/use-expert'
import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import {
  UserCircle2,
  History,
  Gavel,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Flag,
  RotateCcw,
  ShieldCheck,
  CircleUserRound,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react";

export const ExpertApplicationViewPage = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const {
    data,
    isLoading,
    error,
  } = useExpertApplicationView(expertId!);
  console.log(data);
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data?.data) {
    return <div>No data found.</div>;
  }

  const { expert, kyc, banking } = data.data;

  return (
    <div className="min-h-screen bg-[#0B0B0B] p-6">

      {/* Header */}
      <div className="mb-8">

        {/* Arrow + Title */}
        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate("/experts/management")}
            className="text-white hover:text-gray-300"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-xl font-semibold text-white">
            Application View
          </h1>

        </div>

        {/* Breadcrumb */}
        <p className="mt-5 text-sm text-gray-400">
          Expert Management /
          <span className="mx-1">Manage Expert</span> /
          <span className="ml-1 text-white">
            {expert.fullname}
          </span>
        </p>

        {/* Section Title */}
        <p className="mt-5 text-base font-semibold text-white">
          Application Details
        </p>

      </div>

      {/* Profile Card */}
      <div className="rounded-2xl bg-[#1A1A1A] p-6">

        {/* Top Row */}
        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-lg font-semibold text-white">
              {expert.fullname}
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Applied on{" "}
              {new Date(expert.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-3">

            <span className="rounded-md bg-yellow-600/20 px-4 py-2 text-sm font-medium text-yellow-400">
              {expert.applicationStatus}
            </span>

            <span className="rounded-md bg-green-600/20 px-4 py-2 text-sm font-medium text-green-400">
              {kyc?.status || "Not Submitted"}
            </span>

          </div>

        </div>

        {/* Bottom Row */}
        <div className="mt-6 grid grid-cols-3 gap-5">

          <div className="rounded-xl bg-[#111111] p-4">
            <p className="text-xs text-gray-400">
              Expert ID
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              #{expert._id}
            </p>
          </div>

          <div className="rounded-xl bg-[#111111] p-4">
            <p className="text-xs text-gray-400">
              Submitted
            </p>

            <p className="mt-2 text-white">
              {new Date(expert.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-[#111111] p-4">
            <p className="text-xs text-gray-400">
              Last Updated
            </p>

            <p className="mt-2 text-white">
              {new Date(expert.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>

        </div>

      </div>

      {/* Tabs */}
      <div className="mt-6 rounded-xl bg-[#1A1A1A] p-1">
        <div className="grid grid-cols-3">

          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-lg py-3 text-sm font-medium transition ${activeTab === "overview"
              ? "bg-[#2A2A2A] text-white"
              : "text-gray-400 hover:text-white"
              }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`rounded-lg py-3 text-sm font-medium transition ${activeTab === "kyc"
              ? "bg-[#2A2A2A] text-white"
              : "text-gray-400 hover:text-white"
              }`}
          >
            KYC Details
          </button>

          <button
            onClick={() => setActiveTab("banking")}
            className={`rounded-lg py-3 text-sm font-medium transition ${activeTab === "banking"
              ? "bg-[#2A2A2A] text-white"
              : "text-gray-400 hover:text-white"
              }`}
          >
            Banking Details
          </button>

        </div>
      </div>

      {/* Content */}
      <div className="mt-6">

        {activeTab === "overview" && (

          <div className="mt-6 grid grid-cols-2 gap-6">

            <div className="rounded-xl bg-[#1A1A1A] p-6">
              <div className="mb-6 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                <UserCircle2
                  size={22}
                  className="text-white"
                />

                <h2 className="text-base font-semibold text-white">
                  Applicant Information
                </h2>

              </div>

              <div className="grid grid-cols-2 gap-x-10 gap-y-6">

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Full Name
                  </p>

                  <p className="mt-2 text-white">
                    {expert.fullname}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Phone Number
                  </p>

                  <p className="mt-2 text-white">
                    {expert.phone}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Work Email
                  </p>

                  <p className="mt-2 text-white">
                    {expert.email}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Service Type
                  </p>

                  <p className="mt-2 text-white capitalize">
                    {expert.servicetype}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Current Role
                  </p>

                  <p className="mt-2 text-white">
                    {expert.workExperience?.[0]?.jobTitle || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-[12px] text-[#8C8C8C]">
                    Service Category
                  </p>

                  <p className="mt-2 text-white">
                    {expert.basicProfile?.serviceCategory || "-"}
                  </p>
                </div>

              </div>
            </div>

            {/* Right Side */}
            <div className="flex flex-col gap-6">

              {/* Application Notes */}
              <div className="rounded-xl bg-[#1A1A1A] p-6">
                <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                  <History
                    size={22}
                    className="text-white"
                  />

                  <h2 className="text-base font-semibold text-white">
                    Application Notes
                  </h2>

                </div>

                <div className="rounded-lg bg-[#111111] p-4 text-gray-400">
                  No notes yet.
                </div>
              </div>

              {/* Decision Controls */}
              <div className="rounded-xl bg-[#1A1A1A] p-6">
                <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                  <Gavel
                    size={22}
                    className="text-white"
                  />

                  <h2 className="text-base font-semibold text-white">
                    Decision Controls
                  </h2>

                </div>

                <div className="flex items-center gap-3">

                  <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white whitespace-nowrap">
                    Approve Application
                    <CheckCircle2 size={14} />
                  </button>

                  <button className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white whitespace-nowrap">
                    Reject Application
                    <XCircle size={14} />
                  </button>

                  <button className="flex items-center gap-2 rounded-lg bg-[#0F0F0F] px-4 py-2 text-xs font-medium text-white whitespace-nowrap">
                    Flag for review
                    <Flag size={14} />
                  </button>

                </div>
              </div>

            </div>

          </div>
        )}


        {activeTab === "kyc" && (
          <div className="mt-6 flex flex-col gap-6">

            {/* First Row */}
            <div className="grid grid-cols-2 gap-6">

              {/* KYC Details */}
              <div className="rounded-xl bg-[#1A1A1A] px-5 py-6">
                <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                  <UserCircle2
                    size={20}
                    className="text-white"
                  />

                  <h2 className="text-base font-semibold text-white">
                    KYC Details
                  </h2>

                </div>
                <div className="grid grid-cols-2 gap-x-10 gap-y-10">

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      Individual Name / Organisation Name
                    </p>

                    <p className="mt-2 text-sm font-medium text-white">
                      {kyc.legalName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      State
                    </p>

                    <p className="mt-2 text-sm font-medium text-white">
                      {kyc.state}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      PAN Number
                    </p>

                    <p className="mt-2 text-sm font-medium text-white">
                      {kyc.panNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      Sample Work Link
                    </p>

                    <a
                      href={kyc.sampleWorkLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-white underline"
                    >
                      View Sample
                    </a>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      GST Information
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-md px-4 py-1 text-sm font-medium ${kyc.hasGST
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                        }`}
                    >
                      {kyc.hasGST ? "Yes" : "No"}
                    </span>
                  </div>

                  <div>
                    <p className="text-[12px] text-[#8C8C8C]">
                      GST Number
                    </p>

                    <p className="mt-2 text-sm font-medium text-white">
                      {kyc.gstNumber || "NA"}
                    </p>
                  </div>

                </div>
              </div>

              {/* Right Side */}
              <div className="flex flex-col gap-6">

                {/* Digilocker */}
                <div className="rounded-xl bg-[#1A1A1A] px-7 py-6">

                  <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                    <ShieldCheck size={18} />

                    <h2 className="text-base font-semibold text-white">
                      Digilocker Verified Document
                    </h2>

                  </div>

                  <div className="rounded-xl bg-[#111111] px-5 py-4 flex items-center justify-between">

                    <div>

                      <p className="text-[15px] font-medium text-white">
                        Document
                      </p>

                      <p className="mt-1 text-[12px] text-[#8C8C8C]">
                        PDF
                      </p>

                    </div>

                    <a
                      href={kyc.documents.panCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-[#8C8C8C] hover:text-white"
                    >
                      View
                    </a>

                  </div>


                </div>

                <div className="rounded-xl bg-[#1A1A1A] p-6">

                  <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                    <UserCircle2 size={20} />

                    <h2 className="text-base font-semibold text-[15px] text-white">
                      Compliance & Declaration
                    </h2>

                  </div>

                  <div className="space-y-10">

                    <div className="flex items-center justify-between">

                      <p className="text-[15px] text-white">
                        Filed last 2 years IT Returns
                      </p>

                      <span className="rounded-md bg-green-600/20 px-5 py-[4px] rounded-lg text-[13px] text-sm text-green-400">
                        N/A
                      </span>

                    </div>

                    <div className="flex items-center justify-between">

                      <p className="text-white">
                        Undertaking Signed
                      </p>

                      <span className="rounded-md bg-green-600/20 px-4 py-1 text-sm text-green-400">
                        N/A
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-xl bg-[#1A1A1A] p-6">

              <h2 className="mb-6 border-b border-[#2D2D2D] pb-4 text-base font-semibold text-white">
                Uploaded Documents
              </h2>

              <div className="grid grid-cols-4 gap-4">

                {[
                  {
                    title: "PAN Card",
                    url: kyc.documents.panCardUrl,
                  },
                  {
                    title: "GST Certificate",
                    url: kyc.documents.gstCertificateUrl,
                  },
                  {
                    title: "Certificate / License",
                    url: kyc.documents.licenceOrCertificateUrl,
                  },
                  {
                    title: "Sample Work",
                    url: kyc.documents.sampleWorkFileUrl,
                  },
                ].map((doc) => (

                  <div
                    key={doc.title}
                    className="rounded-lg bg-[#111111] px-5 py-4"
                  >

                    <p className="font-medium text-white">
                      {doc.title}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      PDF
                    </p>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block rounded-md bg-[#1E1E1E] px-4 py-2 text-sm text-white"
                    >
                      View Document
                    </a>

                  </div>

                ))}

              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">

              <div className="rounded-xl bg-[#1A1A1A] p-6">

                <div className="mb-5 flex items-center gap-2 border-b border-[#2D2D2D] pb-4">

                  <History size={20} />

                  <h2 className="text-base font-semibold text-white">
                    Application Notes
                  </h2>

                </div>

                <div className="rounded-lg bg-[#111111] p-4 text-gray-400">
                  No notes yet.
                </div>

              </div>

              {/* Decision Controls */}
              <div className="rounded-xl bg-[#1A1A1A] p-6">
                {/* Header */}
                <div className="mb-5 flex items-center gap-2 border-b border-[#2A2A2A] pb-4">
                  <Gavel size={18} className="text-white" />
                  <h2 className="text-base font-semibold text-white">
                    Decision Controls
                  </h2>
                </div>

             <div className="flex flex-1 h-10 items-center justify-center gap-2 rounded-lg text-xs font-medium whitespace-nowrap">

                  {/* Approve */}
                  <button className="flex h-11 w-[120px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-4 text-[13px] font-medium text-white whitespace-nowrap">
                    <span>Approve</span>
                    <CheckCircle2 size={16} />
                  </button>

                  {/* Ask for Re-Submit */}
                  <button className="flex h-11 w-[160px] items-center justify-center gap-2 rounded-lg bg-[#D8A15A] px-4 text-[13px] font-medium text-black whitespace-nowrap">
                    <span>Ask for Re-Submit</span>
                    <RotateCcw size={16} />
                  </button>

                  {/* Escalate */}
                  <button className="flex h-11 w-[100px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 text-[13px] font-medium text-white whitespace-nowrap">
                    <span>Escalate</span>
                    <ArrowUpRight size={16} />
                  </button>

                  {/* Reject */}
                  <button className="flex h-11 w-[150px] items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 text-[13px] font-medium text-white whitespace-nowrap">
                    <span>Reject Application</span>
                    <XCircle size={16} />
                  </button>

                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === "banking" && (

          <div className="mt-6 flex flex-col gap-6">

            {/* First Row */}
            <div className="grid grid-cols-2 gap-6">

              {/* Left Card */}
              <div className="rounded-xl bg-[#1A1A1A] p-5">

                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                  <CircleUserRound size={22} />
                  Account Information
                </h2>

                <div className="mb-6 border-b border-[#333]" />

                <div className="grid grid-cols-3 gap-y-8">

                  {/* Beneficiary */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Beneficiary Name
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      {banking.beneficiaryName}
                    </p>
                  </div>

                  {/* Provided Name */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Provided Name
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      {expert.fullname}
                    </p>
                  </div>

                  {/* Match Score */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Name Match Score
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      85%
                    </p>
                  </div>

                  {/* Account Type */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Account Type
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      {banking.accountType}
                    </p>
                  </div>

                  {/* Account Number */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Account Number
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      ********{banking.accountNumber?.slice(-4)}
                    </p>
                  </div>

                  <div />

                  {/* Bank Name */}
                  <div>
                    <p className="text-sm text-gray-400">
                      Bank Name
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      {banking.bankName}
                    </p>
                  </div>

                  {/* IFSC */}
                  <div>
                    <p className="text-sm text-gray-400">
                      IFSC Code
                    </p>

                    <p className="mt-2 text-[13px] font-medium text-white">
                      {banking.ifscCode}
                    </p>
                  </div>

                </div>

              </div>

              {/* Right Side */}
              <div className="flex flex-col gap-6">

                {/* Bank Verification */}
                <div className="rounded-xl bg-[#1A1A1A] p-6">

                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                    <ShieldCheck size={22} />
                    Bank Verification Document
                  </h2>

                  <div className="mb-6 border-b border-[#333]" />

                  <div className="rounded-xl bg-[#111111] p-5">

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <BadgeCheck
                          size={22}
                          className="text-green-500"
                        />

                        <div>

                          <p className="font-medium text-white">
                            Cancelled Cheque
                          </p>

                          <p className="text-sm text-gray-400">
                            PDF
                          </p>

                        </div>

                      </div>

                      <a
                        href={banking.documents.cancelledChequeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-white"
                      >
                        View
                      </a>

                    </div>

                  </div>

                </div>

                <div className="rounded-xl bg-[#1A1A1A] p-6">

                  <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                    <History size={22} />
                    Application Notes
                  </h2>

                  <div className="mb-6 border-b border-[#333]" />

                  <div className="rounded-xl bg-[#111111] p-5 text-gray-500">
                    No notes yet.
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-2 gap-6">

              {/* Decision Controls */}
              <div className="rounded-xl bg-[#1A1A1A] p-6">

                {/* Header */}
                <div className="mb-5 flex items-center gap-2 border-b border-[#2A2A2A] pb-4">
                  <Gavel size={18} className="text-white" />

                  <h2 className="text-base font-semibold text-white">
                    Decision Controls
                  </h2>
                </div>

                <div className="flex items-center gap-2">

                  {/* Approve */}
                  <button
                    className="flex h-11 w-[120px] items-center justify-center gap-2 rounded-lg bg-[#16A34A] px-3 text-[13px] font-medium text-white whitespace-nowrap"
                  >
                    <span>Approve</span>
                    <CheckCircle2 size={16} />
                  </button>

                  {/* Ask for Re-Submit */}
                  <button
                    className="flex h-11 w-[160px] items-center justify-center gap-2 rounded-lg bg-[#D8A15A] px-3 text-[13px] font-medium text-black whitespace-nowrap"
                  >
                    <span>Ask for Re-Submit</span>
                    <RotateCcw size={16} />
                  </button>

                  {/* Escalate */}
                  <button
                    className="flex h-11 w-[120px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-3 text-[13px] font-medium text-white whitespace-nowrap"
                  >
                    <span>Escalate</span>
                    <ArrowUpRight size={16} />
                  </button>

                  {/* Reject */}
                  <button
                    className="flex h-11 w-[160px] items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-3 text-[13px] font-medium text-white whitespace-nowrap"
                  >
                    <span>Reject Application</span>
                    <XCircle size={16} />
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );

}
