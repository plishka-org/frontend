import { useState, useEffect, useRef, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";
import type {
  Product,
  Category,
  PriceActionType,
  PriceTargetType,
} from "../../../types/product";
import {
  fetchProductsApi,
  fetchCategoriesApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  deleteProductsApi,
  uploadProductMediaApi,
  deleteProductMediaApi,
  setMainMediaApi,
  bulkUpdatePricesApi,
  reorderProductsApi,
} from "../../../services/api/productsApi";
import { useToast } from "../../../hooks/useToast";
import trashIcon from "../../../icons/trash.png";
import editIcon from "../../../icons/Type=Edit.png";
import roundIcon from "../../../icons/Round.png";
import packIcon from "../../../icons/Type=Pack.png";
import "./adminProductsPage.scss";

const MAX_MAIN_PRODUCTS = 10;
const ITEMS_PER_PAGE = 10;
const NO_CATEGORY_ID = -1;

const PRICE_ACTIONS: PriceActionType[] = ["+%", "-%", "+", "-"];

function pluralizeProductWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "виріб";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
    return "вироби";
  return "виробів";
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ size = 16 }: { size?: number }) {
  return (
    <img src={trashIcon} width={size} height={size} alt="" aria-hidden="true" />
  );
}

function EditIcon() {
  return (
    <img src={editIcon} width={16} height={16} alt="" aria-hidden="true" />
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronIcon({
  direction = "down",
}: {
  direction?: "down" | "up" | "left" | "right";
}) {
  const deg = { down: 0, up: 180, left: 90, right: -90 }[direction];
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ transform: `rotate(${deg}deg)`, transition: "transform 0.2s" }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface DeleteConfirmModalProps {
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

function DeleteConfirmModal({
  count,
  onCancel,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  const isMultiple = count > 1;

  return (
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="delete-confirm-modal__card">
        <div className="delete-confirm-modal__header">
          <h2 className="delete-confirm-modal__title">
            {isMultiple ? "Видалення виробів" : "Видалення виробу"}
          </h2>
          <button
            type="button"
            className="delete-confirm-modal__close"
            onClick={onCancel}
            aria-label="Закрити"
          >
            <CloseIcon />
          </button>
        </div>

        <p className="delete-confirm-modal__question">
          {isMultiple
            ? `Чи дійсно ви бажаєте видалити ${count} виробів?`
            : "Чи дійсно ви бажаєте видалити виріб?"}
        </p>
        <p className="delete-confirm-modal__hint">
          {isMultiple
            ? "Якщо видалити вироби, їх неможливо буде повернути"
            : "Якщо видалити виріб, його неможливо буде повернути"}
        </p>

        <div className="delete-confirm-modal__actions">
          <button
            type="button"
            className="delete-confirm-modal__btn delete-confirm-modal__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Ні, повернутися назад
          </button>
          <button
            type="button"
            className="delete-confirm-modal__btn delete-confirm-modal__btn--confirm"
            onClick={onConfirm}
            disabled={loading}
          >
            <TrashIcon size={16} />
            {isMultiple ? "Так, видалити вироби" : "Так, видалити виріб"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DragIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" />
      <circle cx="15" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

interface MultiSelectProps {
  options: Category[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Категорія",
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 180);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const allSelected = selected.length === 0;

  function toggleAll() {
    onChange([]);
  }

  function toggle(id: number) {
    onChange(
      selected.includes(id)
        ? selected.filter((s) => s !== id)
        : [...selected, id],
    );
  }

  const label = (() => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      if (selected[0] === NO_CATEGORY_ID) return "Без категорії";
      return options.find((o) => o.id === selected[0])?.name ?? placeholder;
    }
    return `${selected.length} категорії`;
  })();

  return (
    <div className="multi-select" ref={ref}>
      <button
        type="button"
        className="multi-select__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={selected.length === 0 ? "multi-select__placeholder" : ""}
        >
          {label}
        </span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="multi-select__dropdown" ref={dropdownRef}>
          <label className="multi-select__option">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span>Усі категорії</span>
          </label>

          <label className="multi-select__option multi-select__option--special">
            <input
              type="checkbox"
              checked={selected.includes(NO_CATEGORY_ID)}
              onChange={() => toggle(NO_CATEGORY_ID)}
            />
            <span>Без категорії</span>
          </label>

          <div className="multi-select__divider" />

          {options.map((opt) => (
            <label key={opt.id} className="multi-select__option">
              <input
                type="checkbox"
                checked={selected.includes(opt.id)}
                onChange={() => toggle(opt.id)}
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Delete target dropdown ───────────────────────────────────
interface DeleteTargetDropdownProps {
  value: "selected" | "unselected" | "all" | "category";
  onChange: (value: "selected" | "unselected" | "all" | "category") => void;
  options: { value: string; label: string }[];
}

function DeleteTargetDropdown({
  value,
  onChange,
  options,
}: DeleteTargetDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 160);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const currentLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="delete-target-dropdown" ref={ref}>
      <button
        type="button"
        className="delete-target-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="delete-target-dropdown__dropdown" ref={dropdownRef}>
          {options.map((opt) => (
            <label key={opt.value} className="delete-target-dropdown__option">
              <input
                type="radio"
                name="deleteTarget"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => {
                  onChange(
                    opt.value as "selected" | "unselected" | "all" | "category",
                  );
                  setOpen(false);
                }}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Change Category From Dropdown ────────────────────────────
type ChangeCategoryFromType = "selected" | "unselected" | "all" | "category";

interface ChangeCategoryFromDropdownProps {
  value: ChangeCategoryFromType;
  onChange: (value: ChangeCategoryFromType) => void;
}

function ChangeCategoryFromDropdown({
  value,
  onChange,
}: ChangeCategoryFromDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 160);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const OPTIONS: { value: ChangeCategoryFromType; label: string }[] = [
    { value: "selected", label: "Обраних" },
    { value: "unselected", label: "Не обраних" },
    { value: "all", label: "Усіх товарів" },
    { value: "category", label: "За категорією" },
  ];

  const currentLabel = OPTIONS.find((o) => o.value === value)?.label ?? "";

  return (
    <div className="change-category-from-dropdown" ref={ref}>
      <button
        type="button"
        className="change-category-from-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div
          className="change-category-from-dropdown__dropdown"
          ref={dropdownRef}
        >
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="change-category-from-dropdown__option"
            >
              <input
                type="radio"
                name="changeCategoryFrom"
                value={opt.value}
                checked={value === opt.value}
                onChange={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              />
              <span className="change-category-from-dropdown__radio" />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Radio Dropdown (single category picker) ────────
interface CategoryRadioDropdownProps {
  options: Category[];
  value: number | "";
  onChange: (id: number) => void;
  placeholder?: string;
}

function CategoryRadioDropdown({
  options,
  value,
  onChange,
  placeholder = "Категорія",
}: CategoryRadioDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 220);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const currentLabel =
    options.find((o) => o.id === value)?.name ?? placeholder;

  return (
    <div className="category-radio-dropdown" ref={ref}>
      <button
        type="button"
        className="category-radio-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={
            value === ""
              ? "category-radio-dropdown__placeholder"
              : undefined
          }
        >
          {currentLabel}
        </span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="category-radio-dropdown__dropdown" ref={dropdownRef}>
          {options.map((opt) => (
            <label key={opt.id} className="category-radio-dropdown__option">
              <input
                type="radio"
                name="categoryRadio"
                checked={value === opt.id}
                onChange={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              />
              <span className="category-radio-dropdown__radio" />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Action Dropdown ───────────────────────────────────
interface PriceActionDropdownProps {
  value: PriceActionType;
  onChange: (value: PriceActionType) => void;
}

function PriceActionDropdown({ value, onChange }: PriceActionDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 160);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const LABELS: Record<PriceActionType, string> = {
    "+%": "+ %",
    "-%": "- %",
    "+": "+ грн",
    "-": "- грн",
  };

  return (
    <div className="price-action-dropdown" ref={ref}>
      <button
        type="button"
        className="price-action-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{LABELS[value]}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="price-action-dropdown__dropdown" ref={dropdownRef}>
          {PRICE_ACTIONS.map((a) => (
            <label key={a} className="price-action-dropdown__option">
              <input
                type="radio"
                name="priceAction"
                value={a}
                checked={value === a}
                onChange={() => {
                  onChange(a);
                  setOpen(false);
                }}
              />
              <span>{LABELS[a]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Target Dropdown ───────────────────────────────────
interface PriceTargetDropdownProps {
  value: PriceTargetType;
  onChange: (value: PriceTargetType) => void;
}

function PriceTargetDropdown({ value, onChange }: PriceTargetDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 180);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const LABELS: Record<PriceTargetType, string> = {
    all: "Усі",
    category: "За категорією",
    selected: "Обрані",
    unselected: "Не обрані",
  };

  const OPTIONS: PriceTargetType[] = ["all", "selected", "unselected", "category"];

  const currentLabel = LABELS[value];

  return (
    <div className="price-target-dropdown" ref={ref}>
      <button
        type="button"
        className="price-target-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="price-target-dropdown__dropdown" ref={dropdownRef}>
          {OPTIONS.map((opt) => (
            <label key={opt} className="price-target-dropdown__option">
              <input
                type="radio"
                name="priceTarget"
                value={opt}
                checked={value === opt}
                onChange={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              />
              <span>{LABELS[opt]}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category Dropdown (used for "Оберіть категорію" in add form) ────
interface CategoryDropdownProps {
  options: Category[];
  value: number | "";
  onChange: (id: number) => void;
  placeholder?: string;
}

function CategoryDropdown({
  options,
  value,
  onChange,
  placeholder = "Категорія",
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open || !dropdownRef.current || !ref.current) return;
    const triggerRect = ref.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - triggerRect.bottom - 12;
    const maxH = Math.max(spaceBelow, 220);
    dropdownRef.current.style.maxHeight = `${maxH}px`;
  }, [open]);

  const currentLabel =
    options.find((o) => o.id === value)?.name ?? placeholder;

  return (
    <div className="category-dropdown" ref={ref}>
      <button
        type="button"
        className={`category-dropdown__trigger${value === "" ? " category-dropdown__trigger--empty" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{currentLabel}</span>
        <ChevronIcon direction={open ? "up" : "down"} />
      </button>
      {open && (
        <div className="category-dropdown__dropdown" ref={dropdownRef}>
          <label className="category-dropdown__option">
            <input
              type="radio"
              name="categoryDropdown"
              checked={value === ""}
              onChange={() => setOpen(false)}
            />
            <span>{placeholder}</span>
          </label>
          <div className="category-dropdown__divider" />
          {options.map((opt) => (
            <label key={opt.id} className="category-dropdown__option">
              <input
                type="radio"
                name="categoryDropdown"
                checked={value === opt.id}
                onChange={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
              />
              <span>{opt.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`toggle${checked ? " toggle--on" : ""}${disabled ? " toggle--disabled" : ""}`}
      onClick={() => !disabled && onChange(!checked)}
    />
  );
}

interface EditModalProps {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (
    id: number,
    data: Partial<Product>,
    newFiles: File[],
    deletedMediaIds: number[],
    mainMediaId: number | null,
  ) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function EditModal({
  product,
  categories,
  onClose,
  onSave,
  onDelete,
}: EditModalProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [description, setDescription] = useState(product.description);
  const [existingMedia, setExistingMedia] = useState(product.media);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [mainMediaId, setMainMediaId] = useState<number | null>(
    product.media.find((m) => m.isMain)?.id ?? null,
  );
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<{
    type: "existing" | "new";
    id: number;
  } | null>(null);

  function handleFileAdd(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const url = URL.createObjectURL(f);
      setNewPreviews((prev) => [...prev, url]);
    });
    e.target.value = "";
  }

  function handleDeleteExisting(id: number) {
    setDeletedMediaIds((prev) => [...prev, id]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
    if (mainMediaId === id) setMainMediaId(null);
  }

  function handleDeleteNew(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleReplaceNew(idx: number, file: File) {
    const oldUrl = newPreviews[idx];
    const newUrl = URL.createObjectURL(file);
    setNewFiles((prev) => prev.map((f, i) => (i === idx ? file : f)));
    setNewPreviews((prev) => prev.map((u, i) => (i === idx ? newUrl : u)));
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  }

  function handleReplaceExisting(id: number, file: File) {
    setDeletedMediaIds((prev) => [...prev, id]);
    setExistingMedia((prev) => prev.filter((m) => m.id !== id));
    if (mainMediaId === id) setMainMediaId(null);
    setNewFiles((prev) => [...prev, file]);
    setNewPreviews((prev) => [...prev, URL.createObjectURL(file)]);
  }

  function handleReplaceFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTarget) return;
    if (replaceTarget.type === "existing") {
      handleReplaceExisting(replaceTarget.id, file);
    } else {
      handleReplaceNew(replaceTarget.id, file);
    }
    setReplaceTarget(null);
  }

  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(
        product.id,
        { name, price: Number(price), categoryId, description },
        newFiles,
        deletedMediaIds,
        mainMediaId,
      );
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка збереження");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      await onDelete(product.id);
      onClose();
    } catch {
      //
    } finally {
      setSaving(false);
    }
  }

  const allMedia = [
    ...existingMedia.map((m) => ({
      type: "existing" as const,
      id: m.id,
      url: m.url,
    })),
    ...newPreviews.map((url, i) => ({ type: "new" as const, id: i, url })),
  ];

  return (
    <div
      className="edit-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="edit-modal__card">
        <button
          type="button"
          className="edit-modal__close"
          onClick={onClose}
          aria-label="Закрити"
        >
          <CloseIcon />
        </button>
        <h2 className="edit-modal__title">Редагування</h2>

        <div className="edit-modal__row">
          <label className="edit-modal__field">
            <span>Назва виробу</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="edit-modal__field">
            <span>Ціна виробу</span>
            <div className="edit-modal__price">
              <input
                type="number"
                value={price}
                min={0}
                onChange={(e) => setPrice(e.target.value)}
              />
              <span>Грн</span>
            </div>
          </label>
        </div>

        <label className="edit-modal__field">
          <span>Категорія виробу</span>
          <div className="edit-modal__select-wrap">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronIcon direction="down" />
          </div>
        </label>

        <label className="edit-modal__field edit-modal__field--textarea">
          <span>Опис виробу</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введіть опис"
            maxLength={300}
            rows={3}
          />
          <span className="edit-modal__char-count">
            {description.length}/300
          </span>
        </label>

        <div className="edit-modal__media-grid">
          {allMedia.map((m) => (
            <div key={`${m.type}-${m.id}`} className="edit-modal__media-item">
              <div className="edit-modal__media-img">
                <img src={m.url} alt="" />
              </div>
              <label className="edit-modal__media-radio">
                <input
                  type="radio"
                  name="mainMedia"
                  checked={m.type === "existing" && mainMediaId === m.id}
                  onChange={() => m.type === "existing" && setMainMediaId(m.id)}
                  disabled={m.type === "new"}
                />
                <span>Встановити головним</span>
              </label>
              <div className="edit-modal__media-actions">
                <button
                  type="button"
                  aria-label="Замінити фото"
                  className="edit-modal__media-btn"
                  onClick={() => {
                    setReplaceTarget({ type: m.type, id: m.id });
                    replaceFileRef.current?.click();
                  }}
                >
                  <img
                    src={roundIcon}
                    width={14}
                    height={14}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
                <button
                  type="button"
                  aria-label="Видалити"
                  className="edit-modal__media-btn edit-modal__media-btn--delete"
                  onClick={() =>
                    m.type === "existing"
                      ? handleDeleteExisting(m.id)
                      : handleDeleteNew(m.id)
                  }
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={handleFileAdd}
        />
        <input
          ref={replaceFileRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={handleReplaceFileInputChange}
        />
        <button
          type="button"
          className="edit-modal__add-media"
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon /> Додати фото/відео
        </button>

        <div className="edit-modal__footer">
          {confirmDelete ? (
            <div className="edit-modal__confirm-delete">
              <span>Видалити виріб?</span>
              <button
                type="button"
                className="edit-modal__btn edit-modal__btn--danger"
                onClick={handleDelete}
                disabled={saving}
              >
                Так, видалити
              </button>
              <button
                type="button"
                className="edit-modal__btn"
                onClick={() => setConfirmDelete(false)}
              >
                Скасувати
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="edit-modal__btn edit-modal__btn--danger-outline"
                onClick={() => setConfirmDelete(true)}
                disabled={saving}
              >
                <TrashIcon /> Видалити виріб
              </button>
              <button
                type="button"
                className="edit-modal__btn edit-modal__btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Збереження..." : "Зберегти зміни"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminProductsPage() {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const addFormRef = useRef<HTMLDivElement>(null);
  const allProductsSectionRef = useRef<HTMLDivElement>(null);
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<number | "">("");
  const [newPrice, setNewPrice] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<
    { url: string; isMain: boolean }[]
  >([]);
  const [addLoading, setAddLoading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const [filterCategoryIds, setFilterCategoryIds] = useState<number[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<
    "selected" | "unselected" | "all" | "category"
  >("selected");
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | "">("");
  const [priceAction, setPriceAction] = useState<PriceActionType>("+%");
  const [priceValue, setPriceValue] = useState("");
  const [priceTarget, setPriceTarget] = useState<PriceTargetType>("all");
  const [priceCategoryId, setPriceCategoryId] = useState<number | "">("");
  const [priceLoading, setPriceLoading] = useState(false);
  const [changeCategoryFrom, setChangeCategoryFrom] =
    useState<ChangeCategoryFromType>("selected");
  const [changeCategoryFromCategoryId, setChangeCategoryFromCategoryId] =
    useState<number | "">("");
  const [changeCategoryTo, setChangeCategoryTo] = useState<number | "">("");
  const [search, setSearch] = useState("");

  const [selected, setSelected] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    ids: number[];
  } | null>(null);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);

  const dragIdRef = useRef<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([fetchProductsApi(), fetchCategoriesApi()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((e) => {
        showToast(
          e instanceof Error ? e.message : "Помилка завантаження даних",
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mainProducts = products
    .filter((p) => p.isOnMain)
    .sort((a, b) => (a.mainOrder ?? 0) - (b.mainOrder ?? 0));

  const noCategoryCount = products.filter((p) => !p.categoryId).length;

  const allProductsFiltered = products
    .filter((p) => {
      if (filterCategoryIds.length > 0) {
        const wantsNoCategory = filterCategoryIds.includes(NO_CATEGORY_ID);
        const realIds = filterCategoryIds.filter((id) => id !== NO_CATEGORY_ID);
        const matchesNoCategory = wantsNoCategory && !p.categoryId;
        const matchesReal =
          realIds.length > 0 && realIds.includes(p.categoryId);
        if (!matchesNoCategory && !matchesReal) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.category?.name?.toLowerCase().includes(q) ||
          String(p.price).includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const totalPages = Math.ceil(allProductsFiltered.length / ITEMS_PER_PAGE);
  const paginated = allProductsFiltered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const mainCount = mainProducts.length;
  const isMainFull = mainCount >= MAX_MAIN_PRODUCTS;

  function handleGoToNoCategoryProducts() {
    setFilterCategoryIds([NO_CATEGORY_ID]);
    setSearch("");
    setCurrentPage(1);
    allProductsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function handleAddFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    files.forEach((f, i) => {
      const url = URL.createObjectURL(f);
      setNewPreviews((prev) => [
        ...prev,
        { url, isMain: prev.length === 0 && i === 0 },
      ]);
    });
    e.target.value = "";
  }

  function handleSetMainPreview(idx: number) {
    setNewPreviews((prev) => prev.map((p, i) => ({ ...p, isMain: i === idx })));
  }

  function handleRemovePreview(idx: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (prev[idx]?.isMain && next.length > 0) {
        next[0] = { ...next[0], isMain: true };
      }
      return next;
    });
  }

  function handleReplacePreviewFile(idx: number, file: File) {
    const oldUrl = newPreviews[idx]?.url;
    const newUrl = URL.createObjectURL(file);
    setNewFiles((prev) => prev.map((f, i) => (i === idx ? file : f)));
    setNewPreviews((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, url: newUrl } : p)),
    );
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  }

  function handleReplaceFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || replaceIndex === null) return;
    handleReplacePreviewFile(replaceIndex, file);
    setReplaceIndex(null);
  }

  async function handleAddProduct() {
    if (!newName.trim() || newCategoryId === "" || newPrice.trim() === "")
      return;
    setAddLoading(true);
    try {
      let product = await createProductApi({
        name: newName.trim(),
        categoryId: Number(newCategoryId),
        price: Number(newPrice),
        description: newDescription,
        isOnMain: false,
      });
      if (newFiles.length > 0) {
        product = await uploadProductMediaApi(product.id, newFiles);
      }
      setProducts((prev) => [...prev, product]);
      setNewName("");
      setNewCategoryId("");
      setNewPrice("");
      setNewDescription("");
      setNewFiles([]);
      setNewPreviews([]);
      showToast("Виріб додано");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка додавання");
    } finally {
      setAddLoading(false);
    }
  }

  async function handleToggleMain(product: Product) {
    const willBeOn = !product.isOnMain;
    if (willBeOn && isMainFull) return;

    const newMainOrder = willBeOn ? mainCount + 1 : null;
    try {
      const updated = await updateProductApi(product.id, {
        isOnMain: willBeOn,
        mainOrder: newMainOrder,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка оновлення");
    }
  }

  function requestDeleteBulk() {
    let ids: number[] = [];

    if (deleteTarget === "selected") {
      ids = selected;
    } else if (deleteTarget === "unselected") {
      ids = products.filter((p) => !selected.includes(p.id)).map((p) => p.id);
    } else if (deleteTarget === "all") {
      ids = products.map((p) => p.id);
    } else if (deleteTarget === "category" && deleteCategoryId) {
      ids = products
        .filter((p) => p.categoryId === Number(deleteCategoryId))
        .map((p) => p.id);
    }

    if (!ids.length) return;
    setDeleteConfirm({ ids });
  }

  function requestDeleteOne(id: number) {
    setDeleteConfirm({ ids: [id] });
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return;
    const { ids } = deleteConfirm;
    setDeleteConfirmLoading(true);
    try {
      if (ids.length === 1) {
        await deleteProductApi(ids[0]);
      } else {
        await deleteProductsApi(ids);
      }
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      showToast(ids.length > 1 ? "Вироби видалено" : "Виріб видалено");
      setDeleteConfirm(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка видалення");
    } finally {
      setDeleteConfirmLoading(false);
    }
  }

  async function handleDeleteOne(id: number) {
    try {
      await deleteProductApi(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Виріб видалено");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка видалення");
    }
  }

  async function handlePriceChange() {
    const val = Number(priceValue);
    if (!priceValue || isNaN(val) || val <= 0) return;

    const targetIds =
      priceTarget === "selected"
        ? selected
        : priceTarget === "unselected"
          ? products.filter((p) => !selected.includes(p.id)).map((p) => p.id)
          : undefined;

    setPriceLoading(true);
    try {
      const updated = await bulkUpdatePricesApi({
        action: priceAction,
        value: val,
        target: priceTarget,
        categoryId:
          priceTarget === "category" && priceCategoryId
            ? Number(priceCategoryId)
            : undefined,
        productIds: targetIds,
      });
      setProducts((prev) => {
        const map = new Map(updated.map((p) => [p.id, p]));
        return prev.map((p) => map.get(p.id) ?? p);
      });
      setPriceValue("");
      showToast("Ціни оновлено успішно");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Помилка оновлення цін");
    } finally {
      setPriceLoading(false);
    }
  }

  const handleEditSave = useCallback(
    async (
      id: number,
      data: Partial<Product>,
      files: File[],
      deletedMediaIds: number[],
      mainMediaId: number | null,
    ) => {
      const updated = await updateProductApi(id, data);

      for (const mediaId of deletedMediaIds) {
        await deleteProductMediaApi(id, mediaId);
      }
      let final = updated;
      if (files.length > 0) {
        final = await uploadProductMediaApi(id, files);
      }
      if (mainMediaId !== null) {
        await setMainMediaApi(id, mainMediaId);
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...final } : p)),
      );
      showToast("Зміни збережено");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [],
  );

  function handleDragStart(e: DragEvent<HTMLTableRowElement>, id: number) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent<HTMLTableRowElement>, id: number) {
    e.preventDefault();
    setDragOverId(id);
  }

  async function handleDrop(
    e: DragEvent<HTMLTableRowElement>,
    targetId: number,
  ) {
    e.preventDefault();
    setDragOverId(null);
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) return;

    const list = [...allProductsFiltered];
    const from = list.findIndex((p) => p.id === sourceId);
    const to = list.findIndex((p) => p.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = [...list];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const withOrder = reordered.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    setProducts((prev) => {
      const map = new Map(withOrder.map((p) => [p.id, p]));
      return prev.map((p) => map.get(p.id) ?? p);
    });

    try {
      await reorderProductsApi(withOrder.map((p) => p.id));
    } catch {
      showToast("Помилка збереження порядку");
    }
  }

  const dragMainIdRef = useRef<number | null>(null);
  const [dragOverMainId, setDragOverMainId] = useState<number | null>(null);

  function handleMainDragStart(e: DragEvent<HTMLTableRowElement>, id: number) {
    dragMainIdRef.current = id;
    e.dataTransfer.effectAllowed = "move";
  }

  function handleMainDragOver(e: DragEvent<HTMLTableRowElement>, id: number) {
    e.preventDefault();
    setDragOverMainId(id);
  }

  async function handleMainDrop(
    e: DragEvent<HTMLTableRowElement>,
    targetId: number,
  ) {
    e.preventDefault();
    setDragOverMainId(null);
    const sourceId = dragMainIdRef.current;
    if (!sourceId || sourceId === targetId) return;

    const list = [...mainProducts];
    const from = list.findIndex((p) => p.id === sourceId);
    const to = list.findIndex((p) => p.id === targetId);
    if (from === -1 || to === -1) return;

    const reordered = [...list];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);

    const withOrder = reordered.map((p, i) => ({ ...p, mainOrder: i + 1 }));
    setProducts((prev) => {
      const map = new Map(withOrder.map((p) => [p.id, p]));
      return prev.map((p) => map.get(p.id) ?? p);
    });

    try {
      await Promise.all(
        withOrder.map((p) =>
          updateProductApi(p.id, { mainOrder: p.mainOrder }),
        ),
      );
    } catch {
      showToast("Помилка збереження порядку");
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    const pageIds = paginated.map((p) => p.id);
    const allSelected = pageIds.every((id) => selected.includes(id));
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])],
    );
  }

  const pageIds = paginated.map((p) => p.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  if (loading) {
    return (
      <div className="admin-products__loading">
        <span>Завантаження...</span>
      </div>
    );
  }

  const deleteOptions = [
    { value: "selected", label: "Обрані вироби" },
    { value: "unselected", label: "Не обрані вироби" },
    { value: "all", label: "Усі вироби" },
    { value: "category", label: "Вироби за категорією" },
  ];

  return (
    <div className="admin-products">
      <h1 className="admin-products__title">Вироби</h1>

      {noCategoryCount > 0 && (
        <div className="admin-products__no-category-banner">
          <p className="admin-products__no-category-text">
            У вас є {noCategoryCount} {pluralizeProductWord(noCategoryCount)}{" "}
            без категорії. Вироби не відображаються на сайті для покупців.
            <br />
            Змініть це зараз, щоб товари стали доступні для ваших клієнтів.
          </p>
          <button
            type="button"
            className="admin-products__no-category-btn"
            onClick={handleGoToNoCategoryProducts}
          >
            Перейти до виробів без категорії
            <ChevronIcon direction="right" />
          </button>
        </div>
      )}

      <section className="admin-products__section" ref={addFormRef}>
        <h2 className="admin-products__section-title">Додати новий виріб</h2>
        <div className="admin-products__add-row">
          <label className="admin-products__field">
            <span>Назва виробу</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Альтанка"
            />
          </label>
          <label className="admin-products__field">
            <span>Оберіть категорію</span>
            <CategoryDropdown
              options={categories}
              value={newCategoryId}
              onChange={(id) => setNewCategoryId(id)}
            />
          </label>
          <label className="admin-products__field">
            <span>Введіть ціну виробу</span>
            <div className="admin-products__price-input">
              <input
                type="number"
                value={newPrice}
                min={0}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="1000"
              />
              <span>Грн</span>
            </div>
          </label>
        </div>

        <label className="admin-products__field admin-products__field--textarea">
          <span>Опис виробу</span>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Альтанка"
            maxLength={300}
            rows={3}
          />
          <span className="admin-products__char-count">
            {newDescription.length}/300
          </span>
        </label>

        <div className="admin-products__media">
          <span className="admin-products__field-label">Медіа</span>
          <button
            type="button"
            className="admin-products__media-add"
            onClick={() => addFileRef.current?.click()}
          >
            <PlusIcon /> Додати фото/відео
          </button>
          {newPreviews.length > 0 && (
            <div className="admin-products__media-grid">
              {newPreviews.map((p, i) => (
                <div key={i} className="admin-products__media-item">
                  <div className="admin-products__media-img">
                    <img src={p.url} alt="" />
                  </div>
                  <label className="admin-products__media-radio">
                    <input
                      type="radio"
                      name="newMainMedia"
                      checked={p.isMain}
                      onChange={() => handleSetMainPreview(i)}
                    />
                    <span>Встановити головним</span>
                  </label>
                  <div className="admin-products__media-actions">
                    <button
                      type="button"
                      aria-label="Замінити фото"
                      className="admin-products__media-btn"
                      onClick={() => {
                        setReplaceIndex(i);
                        replaceFileRef.current?.click();
                      }}
                    >
                      <img
                        src={roundIcon}
                        width={14}
                        height={14}
                        alt=""
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      aria-label="Видалити"
                      className="admin-products__media-btn admin-products__media-btn--delete"
                      onClick={() => handleRemovePreview(i)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            className="admin-products__add-btn"
            onClick={handleAddProduct}
            disabled={
              addLoading ||
              !newName.trim() ||
              newCategoryId === "" ||
              newPrice.trim() === ""
            }
          >
            {addLoading ? "Додавання..." : "Додати виріб"}
          </button>
          <input
            ref={addFileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleAddFileChange}
          />
          <input
            ref={replaceFileRef}
            type="file"
            accept="image/*,video/*"
            hidden
            onChange={handleReplaceFileInputChange}
          />
        </div>
      </section>

      <section className="admin-products__section admin-products__panel">
        <h2 className="admin-products__section-title">Панель</h2>

        <div className="admin-products__panel-row">
          <span className="admin-products__panel-label">
            Відфільтрувати і показати:
          </span>
          <div className="admin-products__filter-wrap">
            <MultiSelect
              options={categories}
              selected={filterCategoryIds}
              onChange={(ids) => {
                setFilterCategoryIds(ids);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="admin-products__delete-row">
          <span className="admin-products__panel-label">Видалити</span>
          <div className="admin-products__delete-target-wrap">
            <DeleteTargetDropdown
              value={deleteTarget}
              onChange={setDeleteTarget}
              options={deleteOptions}
            />
          </div>
          {deleteTarget === "category" && (
            <div className="admin-products__select-wrap admin-products__select-wrap--sm">
              <select
                value={deleteCategoryId}
                onChange={(e) =>
                  setDeleteCategoryId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">Оберіть категорію</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronIcon direction="down" />
            </div>
          )}
          <button
            type="button"
            className="admin-products__delete-btn"
            onClick={requestDeleteBulk}
            aria-label="Видалити"
          >
            <TrashIcon size={18} />
          </button>
        </div>

        <div className="admin-products__panel-row">
          <span className="admin-products__panel-label">Змінити ціну:</span>
          <div className="admin-products__price-action-wrap">
            <PriceActionDropdown
              value={priceAction}
              onChange={setPriceAction}
            />
          </div>
          <input
            type="number"
            className="admin-products__price-field"
            placeholder="Введіть суму"
            value={priceValue}
            min={1}
            maxLength={10}
            onChange={(e) => {
              const v = e.target.value;
              if (v.length <= 10) setPriceValue(v);
            }}
          />
          <div className="admin-products__price-target-wrap">
            <PriceTargetDropdown
              value={priceTarget}
              onChange={setPriceTarget}
            />
          </div>
          {priceTarget === "category" && (
            <div className="admin-products__select-wrap">
              <select
                value={priceCategoryId}
                onChange={(e) => setPriceCategoryId(Number(e.target.value))}
              >
                <option value="">Категорія</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronIcon direction="down" />
            </div>
          )}
          <button
            type="button"
            className="admin-products__action-btn"
            onClick={handlePriceChange}
            disabled={priceLoading || !priceValue}
          >
            {priceLoading ? "..." : "Змінити"}
          </button>
        </div>

        <div className="admin-products__panel-row">
          <span className="admin-products__panel-label">
            Змінити категорію:
          </span>
          <div className="admin-products__change-from-wrap">
            <ChangeCategoryFromDropdown
              value={changeCategoryFrom}
              onChange={setChangeCategoryFrom}
            />
          </div>
          {changeCategoryFrom === "category" && (
            <div className="admin-products__select-wrap admin-products__select-wrap--sm">
              <select
                value={changeCategoryFromCategoryId}
                onChange={(e) =>
                  setChangeCategoryFromCategoryId(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              >
                <option value="">Оберіть категорію</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronIcon direction="down" />
            </div>
          )}
          <span className="admin-products__panel-label">на категорію</span>
          <div className="admin-products__change-to-wrap">
            <CategoryRadioDropdown
              options={categories}
              value={changeCategoryTo}
              onChange={setChangeCategoryTo}
            />
          </div>
          <button
            type="button"
            className="admin-products__action-btn"
            disabled={
              !changeCategoryTo ||
              (changeCategoryFrom === "category" && !changeCategoryFromCategoryId)
            }
            onClick={async () => {
              const targetProds =
                changeCategoryFrom === "selected"
                  ? products.filter((p) => selected.includes(p.id))
                  : changeCategoryFrom === "unselected"
                    ? products.filter((p) => !selected.includes(p.id))
                    : changeCategoryFrom === "all"
                      ? products
                      : products.filter(
                          (p) =>
                            p.categoryId === Number(changeCategoryFromCategoryId),
                        );
              try {
                await Promise.all(
                  targetProds.map((p) =>
                    updateProductApi(p.id, {
                      categoryId: Number(changeCategoryTo),
                    }),
                  ),
                );
                setProducts((prev) =>
                  prev.map((p) =>
                    targetProds.find((t) => t.id === p.id)
                      ? {
                          ...p,
                          categoryId: Number(changeCategoryTo),
                          category: categories.find(
                            (c) => c.id === Number(changeCategoryTo),
                          )!,
                        }
                      : p,
                  ),
                );
                showToast("Категорію змінено");
              } catch {
                showToast("Помилка зміни категорії");
              }
            }}
          >
            Змінити
          </button>
        </div>

        <div className="admin-products__search">
          <span className="admin-products__panel-label">Пошук виробу</span>
          <div className="admin-products__search-wrap">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Введіть назву виробу, категорію або ціну"
            />
            <SearchIcon />
          </div>
        </div>
      </section>

      {mainProducts.length > 0 && (
        <section className="admin-products__section">
          <h2 className="admin-products__section-title">
            Вироби на головній сторінці
          </h2>
          <div className="admin-products__table-wrap">
            <table className="admin-products__table">
              <thead>
                <tr>
                  <th className="admin-products__th--drag" />
                  <th>№</th>
                  <th className="admin-products__th--check" />
                  <th>Фото</th>
                  <th>Назва</th>
                  <th>Категорія</th>
                  <th>Ціна, грн</th>
                  <th>На головній</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {mainProducts.map((p) => (
                  <tr
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleMainDragStart(e, p.id)}
                    onDragOver={(e) => handleMainDragOver(e, p.id)}
                    onDrop={(e) => handleMainDrop(e, p.id)}
                    onDragLeave={() => setDragOverMainId(null)}
                    className={dragOverMainId === p.id ? "is-drag-over" : ""}
                  >
                    <td className="admin-products__td--drag">
                      <DragIcon />
                    </td>
                    <td>{p.mainOrder}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>
                      <div className="admin-products__thumb">
                        {p.media.find((m) => m.isMain) && (
                          <img
                            src={p.media.find((m) => m.isMain)!.url}
                            alt={p.name}
                          />
                        )}
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td
                      className={
                        !p.categoryId
                          ? "admin-products__category-cell--empty"
                          : undefined
                      }
                    >
                      {p.category?.name ?? "Без категорії"}
                    </td>
                    <td>{p.price}</td>
                    <td>
                      <Toggle
                        checked={p.isOnMain}
                        onChange={() => handleToggleMain(p)}
                        disabled={!p.categoryId}
                      />
                    </td>
                    <td>
                      <div className="admin-products__actions">
                        <button
                          type="button"
                          className="admin-products__action-icon"
                          onClick={() => setEditProduct(p)}
                          aria-label="Редагувати"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          className="admin-products__action-icon admin-products__action-icon--delete"
                          onClick={() => requestDeleteOne(p.id)}
                          aria-label="Видалити"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="admin-products__section" ref={allProductsSectionRef}>
        <h2 className="admin-products__section-title">Усі вироби</h2>
        {allProductsFiltered.length === 0 ? (
          <div className="admin-products__empty">
            <img
              src={packIcon}
              width={32}
              height={32}
              alt=""
              aria-hidden="true"
            />
            <p>Виробів поки немає. Додайте свій перший виріб</p>
            <button
              type="button"
              className="admin-products__add-btn"
              onClick={() =>
                addFormRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Додати виріб
            </button>
          </div>
        ) : (
          <>
            <div className="admin-products__table-wrap">
              <table className="admin-products__table">
                <thead>
                  <tr>
                    <th className="admin-products__th--drag" />
                    <th className="admin-products__th--check">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Фото</th>
                    <th>Назва</th>
                    <th>Категорія</th>
                    <th>Ціна, грн</th>
                    <th>На головній</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      onDragOver={(e) => handleDragOver(e, p.id)}
                      onDrop={(e) => handleDrop(e, p.id)}
                      onDragLeave={() => setDragOverId(null)}
                      className={dragOverId === p.id ? "is-drag-over" : ""}
                    >
                      <td className="admin-products__td--drag">
                        <DragIcon />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td>
                        <div className="admin-products__thumb">
                          {p.media.find((m) => m.isMain) && (
                            <img
                              src={p.media.find((m) => m.isMain)!.url}
                              alt={p.name}
                            />
                          )}
                        </div>
                      </td>
                      <td>{p.name}</td>
                      <td
                        className={
                          !p.categoryId
                            ? "admin-products__category-cell--empty"
                            : undefined
                        }
                      >
                        {p.category?.name ?? "Без категорії"}
                      </td>
                      <td>{p.price}</td>
                      <td>
                        <Toggle
                          checked={p.isOnMain}
                          onChange={() => handleToggleMain(p)}
                          disabled={(!p.isOnMain && isMainFull) || !p.categoryId}
                        />
                      </td>
                      <td>
                        <div className="admin-products__actions">
                          <button
                            type="button"
                            className="admin-products__action-icon"
                            onClick={() => setEditProduct(p)}
                            aria-label="Редагувати"
                          >
                            <EditIcon />
                          </button>
                          <button
                            type="button"
                            className="admin-products__action-icon admin-products__action-icon--delete"
                            onClick={() => requestDeleteOne(p.id)}
                            aria-label="Видалити"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-products__pagination">
                <button
                  type="button"
                  className="admin-products__page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronIcon direction="left" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`admin-products__page-btn${currentPage === page ? " admin-products__page-btn--active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="admin-products__page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronIcon direction="right" />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {editProduct && (
        <EditModal
          product={editProduct}
          categories={categories}
          onClose={() => setEditProduct(null)}
          onSave={handleEditSave}
          onDelete={handleDeleteOne}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          count={deleteConfirm.ids.length}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleConfirmDelete}
          loading={deleteConfirmLoading}
        />
      )}
    </div>
  );
}