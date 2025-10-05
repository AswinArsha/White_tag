import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { fulfillmentService, type FulfillmentStage, type FulfillmentTask } from "@/lib/fulfillment";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";

const stageOrder: FulfillmentStage[] = ["new_signup", "tag_writing", "packed", "out_for_delivery", "delivered"];
const stageLabels: Record<FulfillmentStage, string> = {
  new_signup: "New Signups",
  tag_writing: "Tag Writing",
  packed: "Packed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered & Activated",
};

// slim top border accent (no shadows)
const columnAccent: Record<FulfillmentStage, string> = {
  new_signup: "border-t-blue-400",
  tag_writing: "border-t-amber-400",
  packed: "border-t-slate-400",
  out_for_delivery: "border-t-purple-400",
  delivered: "border-t-emerald-400",
};

const formatNumber = (n: number) => new Intl.NumberFormat("en-IN").format(n);

const FulfillmentBoard: React.FC = () => {
  const [items, setItems] = useState<FulfillmentTask[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  // 👇 Controlled popover state to ensure the calendar always opens
  const [dateOpen, setDateOpen] = useState(false);

  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FulfillmentStage | null>(null);
  const isDragging = draggingId !== null;

  const filteredByStage = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    const f = (it: FulfillmentTask) => {
      const matchesText =
        !q ||
        it.name.toLowerCase().includes(q) ||
        (it.email || "").toLowerCase().includes(q) ||
        (it.pet_name || "").toLowerCase().includes(q) ||
        (it.pet_username || "").toLowerCase().includes(q);
      const matchesDate = !date || sameDay(new Date(it.created_at), date);
      return matchesText && matchesDate;
    };
    return stageOrder.reduce<Record<FulfillmentStage, FulfillmentTask[]>>(
      (acc, s) => {
        acc[s] = items.filter((i) => i.stage === s && f(i));
        return acc;
      },
      { new_signup: [], tag_writing: [], packed: [], out_for_delivery: [], delivered: [] }
    );
  }, [items, search, date]);

  useEffect(() => {
    const load = async () => {
      try {
        const tasks = await fulfillmentService.listTasks();
        setItems(tasks);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load fulfillment queue");
      }
    };
    load();
  }, []);

  // Hide page-level vertical scrollbar while this board is mounted
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflowY;
    const prevBody = document.body.style.overflowY;
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflowY = "hidden";
    return () => {
      document.documentElement.style.overflowY = prevHtml;
      document.body.style.overflowY = prevBody;
    };
  }, []);

  const onDropTo = async (stage: FulfillmentStage, id: number) => {
    const current = items.find((i) => i.id === id);
    if (!current) return;

    const prevStage = current.stage;
    if (prevStage === stage) {
      setDragOverStage(null);
      setDraggingId(null);
      return;
    }

    // Optimistic move
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, stage } : it)));
    setDragOverStage(null);
    setDraggingId(null);

    try {
      await fulfillmentService.updateStage(id, stage);
      toast.success(`Moved ${current.name} → ${stageLabels[stage]}`);
    } catch (e) {
      console.error(e);
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, stage: prevStage } : it)));
      toast.error("Failed to move card");
    }
  };

  return (
    <div className="flex flex-col gap-4 min-h-0 h-[calc(100vh-120px)] overflow-y-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Orders Workflow</h2>
<div className="flex items-center gap-2">
        {/* Date filter (controlled Popover) */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-56 justify-start font-normal data-[empty=true]:text-muted-foreground pr-9"
                data-empty={!date}
                aria-label="Filter by date"
                title="Filter by date"
                onClick={() => setDateOpen((v) => !v)} // explicit toggle
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : <span>Filter by date</span>}
              </Button>

              {/* Clear date button (kept inside the same visual area, but won’t hijack the trigger) */}
              {date && (
                <button
                  type="button"
                  aria-label="Clear date"
                  title="Clear date"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                  onMouseDown={(e) => e.preventDefault()} // keep popover state intact
                  onClick={() => {
                    setDate(undefined);
                    // leave popover state unchanged (user can keep it open if they want)
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </PopoverTrigger>

          <PopoverContent
            className="z-[60] w-auto p-0"
            align="start"
            side="bottom"
            sideOffset={6}
            collisionPadding={8}
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d);
                setDateOpen(false); // close after choose
              }}
              initialFocus
              // Optional year bounds if you support dropdown captions
              // fromYear={2020}
              // toYear={2030}
            />
          </PopoverContent>
        </Popover>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search name, email, pet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            aria-label="Search fulfillment tasks"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-2.5 h-5 w-5 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>
      </div>
      </div>

      {/* Board */}
      <div className="overflow-x-auto pb-4 scroll-px-4 flex-1 min-h-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 min-w-[960px] xl:min-w-0 snap-x snap-mandatory px-2 h-full">
          {stageOrder.map((stage) => {
            const isActiveDrop = isDragging && dragOverStage === stage;
            return (
              <div
                key={stage}
                className={[
                  "snap-start rounded-xl bg-card ring-1 ring-border h-full flex flex-col transition-colors transition-all duration-150 ease-out",
                  "border-t-4",
                  columnAccent[stage],
                  isActiveDrop ? "ring-2 ring-blue-500 bg-blue-50" : ""
                ].join(" ")}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverStage !== stage) setDragOverStage(stage);
                }}
                onDragEnter={() => setDragOverStage(stage)}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOverStage((s) => (s === stage ? null : s));
                }}
                onDrop={(e) => {
                  const raw = e.dataTransfer.getData("text/plain");
                  const id = Number(raw);
                  if (id) onDropTo(stage, id);
                  else {
                    setDragOverStage(null);
                    setDraggingId(null);
                  }
                }}
              >
                {/* Column header */}
                <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm rounded-t-xl px-4 py-3 border-b border-border flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{stageLabels[stage]}</h3>
                  <span className="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                    {formatNumber(filteredByStage[stage].length)}
                  </span>
                </div>

                {/* Cards area */}
                <div className="flex-1 space-y-2 px-2 pb-3 pt-2 overflow-y-auto min-h-0">
                  {filteredByStage[stage].length === 0 && (
                    <div
                      className={[
                        "rounded-lg border border-dashed p-4 text-center text-xs",
                        isActiveDrop
                          ? "bg-blue-50 border-blue-400 text-blue-600"
                          : "bg-muted/30 border-border text-muted-foreground"
                      ].join(" ")}
                    >
                      {isActiveDrop ? "Drop here" : "No items yet"}
                    </div>
                  )}

                  {filteredByStage[stage].map((item) => {
                    const isSource = draggingId === item.id;
                    return (
                      <Card
                        key={item.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", String(item.id));
                          e.dataTransfer.effectAllowed = "move";

                          const node = e.currentTarget as HTMLElement;
                          const rect = node.getBoundingClientRect();
                          const clone = node.cloneNode(true) as HTMLElement;
                          clone.style.pointerEvents = "none";
                          clone.style.position = "fixed";
                          clone.style.top = "-10000px";
                          clone.style.left = "-10000px";
                          clone.style.width = `${rect.width}px`;
                          clone.style.height = `${rect.height}px`;
                          clone.style.opacity = "1";
                          clone.style.filter = "none";
                          clone.style.transform = "none";
                          document.body.appendChild(clone);

                          const offsetX = (e.clientX || rect.left + rect.width / 2) - rect.left;
                          const offsetY = (e.clientY || rect.top + rect.height / 2) - rect.top;
                          try {
                            e.dataTransfer.setDragImage(clone, offsetX, offsetY);
                          } catch {}
                          setTimeout(() => clone.remove(), 0);
                          setDraggingId(item.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDragOverStage(null);
                        }}
                        className={[
                          "rounded-md ring-1 ring-border bg-card transition-all duration-150 ease-out cursor-grab hover:bg-muted/40 hover:-translate-y-0.5",
                          isSource ? "opacity-0" : ""
                        ].join(" ")}
                        aria-grabbed={isSource ? "true" : "false"}
                      >
                        <CardHeader >
                          <CardTitle className="text-sm font-medium leading-snug truncate">
                            {item.name}
                          </CardTitle>
                          {item.email && (
                            <div className="text-[11px] text-muted-foreground truncate">{item.email}</div>
                          )}
                          {item.phone && (
                            <div className="text-[11px] text-muted-foreground truncate">{item.phone}</div>
                          )}
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FulfillmentBoard;
