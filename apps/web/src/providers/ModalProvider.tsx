"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";

interface ModalOptions {
  title?: string;
  description?: string;
  content: ReactNode;
  footer?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  type?: "danger" | "info" | "warning";
}

interface ModalContextType {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  confirm: (options: ConfirmOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const openModal = useCallback((newOptions: ModalOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirm = useCallback(({
    title,
    description,
    onConfirm,
    confirmLabel = "Xác nhận",
    cancelLabel = "Hủy",
    type = "info"
  }: ConfirmOptions) => {
    const isDanger = type === "danger";

    setOptions({
      title,
      size: "sm",
      content: (
        <div className="space-y-6">
          <p className="ds-font-body text-center px-4 leading-relaxed opacity-90">
            {description}
          </p>

          {isDanger && (
            <div className="flex items-center justify-center p-5 bg-destructive/10 rounded-3xl border border-destructive/20 transition-all animate-in zoom-in-95">
              <p className="text-destructive font-bold text-center ds-text-tiny tracking-widest leading-normal">
                Hành động này sẽ làm thay đổi vĩnh viễn dữ liệu của bạn, không thể hoàn tác.
              </p>
            </div>
          )}
        </div>
      ),
      footer: (
        <>
          <button
            className="px-6 py-2.5 rounded-xl hover:bg-white/5 transition-colors ds-text-sm font-bold border border-border"
            onClick={() => setIsOpen(false)}
          >
            {cancelLabel}
          </button>
          <button
            className={`px-6 py-2.5 rounded-xl transition-all ds-text-sm font-bold shadow-lg active:scale-95 ${isDanger
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20"
              : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
              }`}
            onClick={async () => {
              await onConfirm();
              setIsOpen(false);
            }}
          >
            {confirmLabel}
          </button>
        </>
      )
    });
    setIsOpen(true);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal, confirm }}>
      {children}
      {options && (
        <Modal
          isOpen={isOpen}
          onClose={closeModal}
          title={options.title}
          description={options.description}
          size={options.size}
          footer={options.footer}
          className={options.className}
        >
          {options.content}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
