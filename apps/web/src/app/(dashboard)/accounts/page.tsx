"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import {
  AccountStats,
  AccountTable,
  AccountForm
} from "@/features/accounts/components";

export default function AccountsPage() {
  const [isAdding, setIsAdding] = useState(false);

  const {
    accounts,
    loading,
    submitting,
    fetchAccounts,
    addAccount,
    deleteAccount,
    bulkDelete,
    connectAccount,
    disconnectAccount
  } = useAccounts();

  const handleAddSubmit = async (data: any) => {
    const result = await addAccount(data);
    if (result.success) {
      setIsAdding(false);
    }
    return result;
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header - Tiêu đề trang */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-foreground">Tài khoản FB</h1>
          <p className="text-text-secondary text-[1.4rem] mt-1">
            Quản lý và kết nối các tài khoản Facebook của bạn để chạy chiến dịch automation.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary h-[4.8rem] px-8 shadow-glow-blue uppercase font-bold tracking-wider"
        >
          {isAdding ? "Đóng Form" : <><Plus size={18} /> Thêm tài khoản</>}
        </button>
      </div>

      {/* Account Creation Form - Form thêm tài khoản */}
      <AccountForm
        isAdding={isAdding}
        submitting={submitting}
        onSubmit={handleAddSubmit}
      />

      {/* Statistics - Các chỉ số thống kê */}
      <AccountStats accounts={accounts} />

      {/* Accounts List - Danh sách tài khoản */}
      <AccountTable
        accounts={accounts}
        loading={loading}
        onRefresh={fetchAccounts}
        onBulkDelete={bulkDelete}
        onConnect={connectAccount}
        onDisconnect={disconnectAccount}
      />
    </div>
  );
}
