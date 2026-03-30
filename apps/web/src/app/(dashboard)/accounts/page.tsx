"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccounts } from "@/features/accounts/hooks/useAccounts";
import {
  AccountStats,
  AccountTable,
  AccountForm
} from "@/features/accounts/components";
import { GroupModal } from "@/features/groups/components/GroupModal";
import { FbAccount } from "@/features/accounts/types";

export default function AccountsPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedForGroups, setSelectedForGroups] = useState<FbAccount | null>(null);
  
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
    <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="h1 text-foreground tracking-tight">Facebook Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý và kết nối các tài khoản Facebook của bạn để chạy chiến dịch.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="action-button bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          {isAdding ? "Đóng Form" : <><Plus size={20} /> Thêm tài khoản</>}
        </button>
      </div>

      {/* Account Creation Form */}
      <AccountForm
        isAdding={isAdding}
        submitting={submitting}
        onSubmit={handleAddSubmit}
      />

      {/* Statistics */}
      <AccountStats accounts={accounts} />

      {/* Accounts List */}
      <AccountTable
        accounts={accounts}
        loading={loading}
        onRefresh={fetchAccounts}
        onBulkDelete={bulkDelete}
        onConnect={connectAccount}
        onDisconnect={disconnectAccount}
        onManageGroups={setSelectedForGroups}
      />

      {/* Modals */}
      <GroupModal 
        account={selectedForGroups}
        isOpen={!!selectedForGroups}
        onClose={() => setSelectedForGroups(null)}
      />
    </div>
  );
}
