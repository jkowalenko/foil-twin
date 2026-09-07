import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FAMILY_LABEL,
  FRONT_FAMILY_ORDER,
  MAST_FAMILY_LABEL,
  MAST_FAMILY_ORDER,
  TAIL_FAMILY_ORDER,
  catalog,
} from "../data/catalog";
import { DISCIPLINES, GOALS, LEVELS } from "../data/labels";
import type {
  Brand,
  Discipline,
  Goal,
  NamedSetup,
  QuiverDoc,
  RiderLevel,
  Setup,
} from "../data/types";
import { FX_DATE, FX_USD_TO_CAD, PRICE_RETRIEVED, priceForCurrency, type CurrencyCode } from "../data/prices";
import { brandName, formatMoney, otherBrand } from "../lib/format";
import {
  analyzeGaps,
  brandConvert,
  listOwnedConvertParts,
  loadQuiver,
  majorityBrand,
  newNamedSetup,
  recommendBuys,
  saveQuiver,
  toggleId,
  upsertNamedSetup,
  type ConvertBuyItem,
  makeConvertBuyItem,
  kitMissingKinds,
} from "../lib/quiver";
import {
  loadQuiverUi,
  saveQuiverUi,
  type QuiverUiPrefs,
} from "../lib/quiverUi";
import { BrandMark } from "./BrandMark";

type Props = {
  onAdopt: (s: Setup) => void;
};

export function QuiverView({ onAdopt }: Props) {
  const [doc, setDoc] = useState<QuiverDoc>(() => loadQuiver());
  const [draft, setDraft] = useState<Omit<NamedSetup, "id">>(() => emptyDraft("axis"));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [convertOff, setConvertOff] = useState<Set<string>>(() => new Set());
  /** null = use algorithm kit; otherwise session-edited list for that tier */
  const [kitEdits, setKitEdits] = useState<{ 80: ConvertBuyItem[] | null; 90: ConvertBuyItem[] | null }>({
    80: null,
    90: null,
  });
  const [ui, setUi] = useState<QuiverUiPrefs>(() => loadQuiverUi());
  const draftRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveQuiver(doc);
  }, [doc]);

  function toggleSection(key: keyof QuiverUiPrefs["sections"]) {
    setUi((prev) => {
      const next: QuiverUiPrefs = {
        version: 1,
        sections: { ...prev.sections, [key]: !prev.sections[key] },
        currency: prev.currency,
      };
      saveQuiverUi(next);
      return next;
    });
  }

  function setCurrency(currency: CurrencyCode) {
    setUi((prev) => {
      const next: QuiverUiPrefs = {
        version: 1,
        sections: { ...prev.sections },
        currency,
      };
      saveQuiverUi(next);
      return next;
    });
  }

  const gaps = useMemo(() => analyzeGaps(doc), [doc]);
  const recs = useMemo(() => recommendBuys(doc), [doc]);
  const ownedConvert = useMemo(() => listOwnedConvertParts(doc), [doc]);
  const convert = useMemo(() => {
    const include = {
      frontIds: doc.parts.frontIds.filter((id) => !convertOff.has(id)),
      tailIds: doc.parts.tailIds.filter((id) => !convertOff.has(id)),
      fuseIds: doc.parts.fuseIds.filter((id) => !convertOff.has(id)),
      mastIds: doc.parts.mastIds.filter((id) => !convertOff.has(id)),
    };
    return brandConvert(doc, include);
  }, [doc, convertOff]);

  const convertBaselineKey = useMemo(() => {
    if (!convert) return "";
    return convert.coverageTiers
      .map((t) => `${t.pct}:${t.items.map((i) => `${i.kind}-${i.twinId}`).join(",")}`)
      .join("|");
  }, [convert]);

  useEffect(() => {
    setKitEdits({ 80: null, 90: null });
  }, [convertBaselineKey]);

  const home = majorityBrand(doc);

  function kitItemsFor(pct: 80 | 90): ConvertBuyItem[] {
    const edited = kitEdits[pct];
    if (edited) return edited;
    return convert?.coverageTiers.find((t) => t.pct === pct)?.items ?? [];
  }

  function removeKitItem(pct: 80 | 90, twinId: string, kind: ConvertBuyItem["kind"]) {
    setKitEdits((prev) => {
      const base = prev[pct] ?? convert?.coverageTiers.find((t) => t.pct === pct)?.items ?? [];
      return { ...prev, [pct]: base.filter((i) => !(i.twinId === twinId && i.kind === kind)) };
    });
  }

  function addKitItem(pct: 80 | 90, kind: ConvertBuyItem["kind"], id: string) {
    if (!id) return;
    const item = makeConvertBuyItem(kind, id, convert?.buyList ?? []);
    if (!item) return;
    setKitEdits((prev) => {
      const base = [...(prev[pct] ?? convert?.coverageTiers.find((t) => t.pct === pct)?.items ?? [])];
      if (base.some((i) => i.kind === kind && i.twinId === id)) return prev;
      base.push(item);
      return { ...prev, [pct]: base };
    });
  }

  function resetKit(pct: 80 | 90) {
    setKitEdits((prev) => ({ ...prev, [pct]: null }));
  }

  function toggleConvert(id: string) {
    setConvertOff((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patch(next: Partial<QuiverDoc> | ((d: QuiverDoc) => QuiverDoc)) {
    setDoc((d) => (typeof next === "function" ? next(d) : { ...d, ...next }));
  }

  function togglePart(kind: "frontIds" | "tailIds" | "fuseIds" | "mastIds", id: string) {
    patch((d) => ({
      ...d,
      parts: { ...d.parts, [kind]: toggleId(d.parts[kind], id) },
    }));
  }

  function startEdit(s: NamedSetup) {
    setEditingId(s.id);
    setDraft({
      label: s.label,
      brand: s.brand,
      mastId: s.mastId,
      fuseId: s.fuseId,
      frontId: s.frontId,
      tailId: s.tailId,
    });
    requestAnimationFrame(() => {
      draftRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft("axis"));
  }

  function commitSetup() {
    const mast = catalog.masts.find((m) => m.id === draft.mastId);
    const fuse = catalog.fuselages.find((f) => f.id === draft.fuseId);
    const front = catalog.fronts.find((f) => f.id === draft.frontId);
    const tail = catalog.tails.find((t) => t.id === draft.tailId);
    if (!mast || !fuse || !front || !tail) return;
    if (
      mast.brand !== draft.brand ||
      fuse.brand !== draft.brand ||
      front.brand !== draft.brand ||
      tail.brand !== draft.brand
    ) {
      return;
    }
    const payload = {
      ...draft,
      label: draft.label.trim() || `${front.familyOfficial} ${front.sizeLabel}`,
    };
    const setup = editingId ? { ...payload, id: editingId } : newNamedSetup(payload);
    patch((d) => upsertNamedSetup(d, setup));
    if (editingId) {
      setEditingId(null);
      setDraft(emptyDraft(payload.brand));
    }
  }

  return (
    <div className="quiver-grid">
      <div className="panel">
        <div className="panel-h">
          <div>
            <h2>Your quiver</h2>
            <div className="sub">Stays in this browser</div>
          </div>
        </div>
        <div className="panel-b">
          <p className="note lede">
            Parts you own, plus named complete setups — mast, fuselage, front, and tail,
            one brand.
          </p>
          <p className="note picker-hint">Tap a part to add to your quiver. Tap again to remove it.</p>

          <PartPicker
            title="Front wings"
            kind="front"
            selected={doc.parts.frontIds}
            onToggle={(id) => togglePart("frontIds", id)}
          />
          <PartPicker
            title="Tails"
            kind="tail"
            selected={doc.parts.tailIds}
            onToggle={(id) => togglePart("tailIds", id)}
          />
          <PartPicker
            title="Fuselages"
            kind="fuse"
            selected={doc.parts.fuseIds}
            onToggle={(id) => togglePart("fuseIds", id)}
          />
          <PartPicker
            title="Masts"
            kind="mast"
            selected={doc.parts.mastIds}
            onToggle={(id) => togglePart("mastIds", id)}
          />

          <h3 className="quiver-h">Named setups</h3>
          {doc.setups.length === 0 && <p className="empty-state">No named setups yet.</p>}
          <ul className="setup-list">
            {doc.setups.map((s) => (
              <li
                key={s.id}
                className={`setup-row${editingId === s.id ? " editing" : ""}`}
              >
                <BrandMark brand={s.brand} size="sm" />
                <div>
                  <strong>{s.label}</strong>
                  <div className="sub">
                    {catalog.masts.find((m) => m.id === s.mastId)?.sizeLabel} ·{" "}
                    {catalog.fuselages.find((f) => f.id === s.fuseId)?.sizeLabel} ·{" "}
                    {catalog.fronts.find((f) => f.id === s.frontId)?.familyOfficial}{" "}
                    {catalog.fronts.find((f) => f.id === s.frontId)?.sizeLabel} ·{" "}
                    {catalog.tails.find((t) => t.id === s.tailId)?.familyOfficial}{" "}
                    {catalog.tails.find((t) => t.id === s.tailId)?.sizeLabel}
                  </div>
                </div>
                <div className="setup-actions">
                  <button
                    type="button"
                    className={`chip${editingId === s.id ? " on" : ""}`}
                    onClick={() => startEdit(s)}
                    aria-pressed={editingId === s.id}
                  >
                    {editingId === s.id ? "Editing" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="chip on"
                    onClick={() =>
                      onAdopt({
                        brand: s.brand,
                        frontId: s.frontId,
                        fuseId: s.fuseId,
                        tailId: s.tailId,
                      })
                    }
                  >
                    Load in Twin
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => {
                      if (editingId === s.id) cancelEdit();
                      patch((d) => ({ ...d, setups: d.setups.filter((x) => x.id !== s.id) }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="quiver-h">{editingId ? "Edit setup" : "Add a setup"}</h3>
          <div ref={draftRef}>
            <SetupDraft
              draft={draft}
              onChange={setDraft}
              onSave={commitSetup}
              onCancel={editingId ? cancelEdit : undefined}
              editing={!!editingId}
            />
          </div>

          <h3 className="quiver-h">Disciplines</h3>
          <div className="chips">
            {DISCIPLINES.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`chip${doc.disciplines.includes(d.id) ? " on" : ""}`}
                onClick={() =>
                  patch((q) => ({
                    ...q,
                    disciplines: toggleDisc(q.disciplines, d.id),
                  }))
                }
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="field">
            <label>Level (optional)</label>
            <div className="chips">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`chip${doc.level === l.id ? " on" : ""}`}
                  onClick={() => patch({ level: l.id as RiderLevel })}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Goal (optional)</label>
            <div className="chips">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`chip${doc.goal === g.id ? " on" : ""}`}
                  onClick={() => patch({ goal: g.id as Goal })}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="quiver-right">
        <CollapsiblePanel
          id="gaps"
          label="Gaps"
          title="Gaps"
          sub="What is still missing for the disciplines you ticked"
          open={ui.sections.gaps}
          onToggle={() => toggleSection("gaps")}
        >
          {gaps.length === 0 && (
            <p className="empty-state">Tick a discipline to see what this quiver still needs.</p>
          )}
          {gaps.map((g) => (
            <div key={g.discipline} className="gap-block">
              <h3>{DISCIPLINES.find((d) => d.id === g.discipline)?.label}</h3>
              {g.missing.length === 0 ? (
                <p className="note ok-note">Looks covered with what you already own.</p>
              ) : (
                <ul className="why">
                  {g.missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CollapsiblePanel>

        <CollapsiblePanel
          id="nextToBuy"
          label="Next to buy"
          title={
            <span className="h-with-logo">
              <BrandMark brand={home} size="sm" />
              Next to buy
            </span>
          }
          sub={`Same-brand first — you mostly ride ${brandName(home)}`}
          open={ui.sections.nextToBuy}
          onToggle={() => toggleSection("nextToBuy")}
        >
          {recs.length === 0 && (
            <p className="empty-state">Add owned parts and a discipline to get buy suggestions.</p>
          )}
          <div className="twin-list">
            {recs.map((r) => (
              <div key={r.partId} className="buy-rec">
                <div className="twin-top">
                  <strong>
                    {r.kind} · {r.title}
                  </strong>
                  <BrandMark brand={r.brand} size="sm" />
                </div>
                <p className="note" style={{ marginTop: 6 }}>
                  {r.why}
                </p>
              </div>
            ))}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          id="brandConvert"
          label="Brand convert"
          title={
            <span className="h-with-logo">
              <BrandMark brand={otherBrand(home)} size="sm" />
              Brand convert
            </span>
          }
          sub={`Starter and more-complete ${brandName(otherBrand(home))} kits closest to what you ride`}
          open={ui.sections.brandConvert}
          onToggle={() => toggleSection("brandConvert")}
          headerExtra={
            <div
              className="currency-row currency-row-header"
              role="group"
              aria-label="Prices currency"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <span className="currency-label">Prices</span>
              <div className="currency-seg">
                <button
                  type="button"
                  className={ui.currency === "USD" ? "on" : ""}
                  aria-pressed={ui.currency === "USD"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrency("USD");
                  }}
                >
                  USD
                </button>
                <button
                  type="button"
                  className={ui.currency === "CAD" ? "on" : ""}
                  aria-pressed={ui.currency === "CAD"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrency("CAD");
                  }}
                >
                  CAD
                </button>
              </div>
            </div>
          }
        >
          {!convert && (
            <p className="empty-state">Add a part you own to see the other brand.</p>
          )}
          {convert && (
            <>
              {ownedConvert.length > 0 && (
                <div className="convert-include">
                  <div className="convert-kind-h">Tick parts to include</div>
                  {(["front", "tail", "fuse", "mast"] as const).map((kind) => {
                    const items = ownedConvert.filter((p) => p.kind === kind);
                    if (!items.length) return null;
                    const kindLabel =
                      kind === "front"
                        ? "Front wings"
                        : kind === "tail"
                          ? "Tails"
                          : kind === "fuse"
                            ? "Fuselages"
                            : "Masts";
                    return (
                      <div key={kind} className="convert-kind">
                        <div className="convert-kind-h">{kindLabel}</div>
                        <div className="convert-checks">
                          {items.map((p) => {
                            const on = !convertOff.has(p.id);
                            return (
                              <label key={p.id} className={on ? "" : "off"}>
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => toggleConvert(p.id)}
                                />
                                {p.title}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="convert-headline">{convert.headline}.</p>
              <div className="pills">
                <span className="pill">
                  Fronts {convert.ownedCounts.fronts} → {convert.uniqueNeeded.fronts} to buy
                </span>
                <span className="pill">
                  Tails {convert.ownedCounts.tails} → {convert.uniqueNeeded.tails} to buy
                </span>
                <span className="pill">
                  Fuses {convert.ownedCounts.fuses} → {convert.uniqueNeeded.fuses} to buy
                </span>
                <span className="pill">
                  Masts {convert.ownedCounts.masts} → {convert.uniqueNeeded.masts} to buy
                </span>
                <span className="pill">
                  {convert.uniqueNeeded.total} {brandName(convert.to)} parts cover what you ticked
                </span>
                {convert.overlapSaved > 0 && (
                  <span className="pill save-pill">Fewer buys than a one-for-one swap</span>
                )}
              </div>
              {convert.frontOverlaps.length > 0 && (
                <div className="overlap-list">
                  <h3>One other-brand front can stand in for several you own</h3>
                  {convert.frontOverlaps.map((g) => (
                    <div key={g.twinId} className="overlap-card">
                      <strong>{g.twinTitle}</strong> can stand in for{" "}
                      {g.owned.map((o) => o.title).join(", ")}. One buy instead of{" "}
                      {g.owned.length}.
                    </div>
                  ))}
                </div>
              )}
              <h3 className="quiver-h">Suggested kits</h3>
              {([80, 90] as const).map((pct) => {
                const tier = convert.coverageTiers.find((t) => t.pct === pct);
                const items = kitItemsFor(pct);
                const sectionKey = pct === 80 ? "kit80" : "kit90";
                const open = ui.sections[sectionKey];
                const missing = kitMissingKinds(items);
                const dirty = kitEdits[pct] != null;
                return (
                  <CollapsiblePanel
                    key={pct}
                    id={`kit-${pct}`}
                    label={pct === 80 ? "Simplified kit" : "Fuller kit"}
                    title={pct === 80 ? "Simplified kit" : "Fuller kit"}
                    sub={tier?.note}
                    open={open}
                    onToggle={() => toggleSection(sectionKey)}
                    nested
                  >
                    {items.length === 0 ? (
                      <p className="note">No other-brand buys in this kit.</p>
                    ) : (
                      <div className="buy-list">
                        {items.map((item) => (
                          <ConvertBuyCard
                            key={`${pct}-${item.kind}-${item.twinId}`}
                            item={item}
                            currency={ui.currency}
                            onRemove={() => removeKitItem(pct, item.twinId, item.kind)}
                          />
                        ))}
                      </div>
                    )}
                    <KitTotal items={items} currency={ui.currency} />
                    {missing.length > 0 && (
                      <p className="note incomplete-kit">Incomplete kit — missing {missing.join(", ")}.</p>
                    )}
                    <KitEditor
                      targetBrand={convert.to}
                      existing={items}
                      onAdd={(kind, id) => addKitItem(pct, kind, id)}
                      onReset={() => resetKit(pct)}
                      dirty={dirty}
                    />
                  </CollapsiblePanel>
                );
              })}
              {convert.rangeSummaries.length > 0 && (
                <div className="convert-ranges">
                  {convert.rangeSummaries.map((r) => (
                    <p key={`${r.kind}-${r.familyOfficial}-${r.minId}`} className="convert-range">
                      {r.note}
                    </p>
                  ))}
                </div>
              )}
              {convert.buyList.length > 0 &&
                convert.buyList.length !==
                  (convert.coverageTiers.find((t) => t.pct === 90)?.items.length ?? 0) && (
                  <>
                    <h3 className="quiver-h">All unique matches</h3>
                    <div className="buy-list">
                      {convert.buyList.map((item) => (
                        <ConvertBuyCard
                          key={`all-${item.kind}-${item.twinId}`}
                          item={item}
                          currency={ui.currency}
                        />
                      ))}
                    </div>
                    <KitTotal items={convert.buyList} currency={ui.currency} label="List total" />
                  </>
                )}
              {convert.buyList.length === 0 &&
                convert.coverageTiers.every((t) => t.items.length === 0) && (
                  <p className="empty-state">Tick owned parts to see other-brand matches.</p>
                )}
              {convert.tableRows.length > 0 && (
                <table className="convert-table">
                  <thead>
                    <tr>
                      <th>You own ({brandName(convert.from)})</th>
                      <th>Closest {brandName(convert.to)}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {convert.tableRows.map((r) => (
                      <tr key={`${r.kind}-${r.ownedId}`}>
                        <td>
                          <span className="kind-tag">{r.kind}</span> {r.ownedTitle}
                        </td>
                        <td>
                          {r.twinTitle ?? "—"}
                          <div className="sub">{r.why}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {convert.path.length > 0 && (
                <div className="convert-path">
                  <h3>If you switched brands</h3>
                  {convert.path.map((p) => (
                    <div key={p.headline} className="path-card">
                      <strong>{p.headline}</strong>
                      <ul className="why">
                        {p.why.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              <p className="price-footnote">
                Manufacturer list prices as of {PRICE_RETRIEVED} (not live cart quotes). CAD est. from
                USD @ {FX_USD_TO_CAD} ({FX_DATE}, Bank of Canada).
              </p>
            </>
          )}
        </CollapsiblePanel>
      </div>
    </div>
  );
}

function CollapsiblePanel({
  id,
  label,
  title,
  sub,
  open,
  onToggle,
  children,
  headerExtra,
  nested,
}: {
  id: string;
  label: string;
  title: ReactNode;
  sub?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  headerExtra?: ReactNode;
  nested?: boolean;
}) {
  const bodyId = `quiver-section-${id}`;
  return (
    <div className={`panel${nested ? " nested-panel" : ""}${open ? "" : " collapsed"}`}>
      <div className="panel-h collapsible-h">
        <button
          type="button"
          className="panel-toggle"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={label}
          onClick={onToggle}
        >
          <span className="panel-toggle-text">
            <span className="panel-title">{title}</span>
            {sub ? <span className="sub">{sub}</span> : null}
          </span>
        </button>
        {headerExtra ? <div className="panel-h-extra">{headerExtra}</div> : null}
        <button
          type="button"
          className="panel-chevron-btn"
          aria-expanded={open}
          aria-controls={bodyId}
          aria-label={label}
          onClick={onToggle}
        >
          <span className={`chevron${open ? " open" : ""}`} aria-hidden="true" />
        </button>
      </div>
      <div className="panel-b" id={bodyId} hidden={!open}>
        {children}
      </div>
    </div>
  );
}

function ConvertBuyCard({
  item,
  currency,
  onRemove,
}: {
  item: ConvertBuyItem;
  currency: CurrencyCode;
  onRemove?: () => void;
}) {
  const completeness = Boolean(item.kitOnly) && item.covers.length === 0;
  const noCovers = item.covers.length === 0;
  const price = priceForCurrency(item.twinId, currency);
  return (
    <div
      className={`buy-item${item.covers.length > 1 ? " overlap" : ""}${completeness ? " kit" : ""}`}
    >
      <div className="twin-top">
        <strong>
          <span className="kind-tag">{item.kind}</span> {item.twinTitle}
        </strong>
        <span className="buy-price">{formatMoney(price, currency)}</span>
        {onRemove ? (
          <button type="button" className="kit-remove" aria-label="Remove from kit" onClick={onRemove}>
            Remove
          </button>
        ) : null}
      </div>
      <div className="twin-tags">
        {completeness ? (
          <span className="kit-tag">complete setup</span>
        ) : noCovers ? (
          <span className="kit-tag">next step</span>
        ) : item.covers.length > 1 ? (
          <span className="savings">covers {item.covers.length} you own</span>
        ) : null}
      </div>
      {noCovers ? (
        <p className="note convert-buy-note" style={{ marginTop: 6 }}>
          {item.note ?? "Included for a complete setup"}
        </p>
      ) : (
        <>
          <p className="note" style={{ marginTop: 6 }}>
            Stands in for {item.covers.map((c) => c.ownedTitle).join(", ")}
          </p>
          {item.note && <p className="note convert-buy-note">{item.note}</p>}
        </>
      )}
    </div>
  );
}

function KitEditor({
  targetBrand,
  existing,
  onAdd,
  onReset,
  dirty,
}: {
  targetBrand: Brand;
  existing: ConvertBuyItem[];
  onAdd: (kind: ConvertBuyItem["kind"], id: string) => void;
  onReset: () => void;
  dirty: boolean;
}) {
  const [kind, setKind] = useState<ConvertBuyItem["kind"]>("front");
  const [partId, setPartId] = useState("");
  const options = useMemo(() => {
    const list =
      kind === "front"
        ? catalog.fronts.filter((p) => p.brand === targetBrand)
        : kind === "tail"
          ? catalog.tails.filter((p) => p.brand === targetBrand)
          : kind === "fuse"
            ? catalog.fuselages.filter((p) => p.brand === targetBrand)
            : catalog.masts.filter((p) => p.brand === targetBrand);
    return list.map((p) => ({
      id: p.id,
      label:
        kind === "mast"
          ? `${(p as { familyOfficial: string }).familyOfficial} ${p.sizeLabel}`
          : kind === "front" || kind === "tail"
            ? `${(p as { familyOfficial: string }).familyOfficial} ${p.sizeLabel}`
            : p.sizeLabel,
    }));
  }, [kind, targetBrand]);

  useEffect(() => {
    setPartId("");
  }, [kind, targetBrand]);

  const taken = new Set(existing.filter((i) => i.kind === kind).map((i) => i.twinId));

  return (
    <div className="kit-editor">
      <div className="kit-editor-row">
        <label className="kit-editor-label">
          Add
          <select value={kind} onChange={(e) => setKind(e.target.value as ConvertBuyItem["kind"])}>
            <option value="front">Front</option>
            <option value="tail">Tail</option>
            <option value="fuse">Fuse</option>
            <option value="mast">Mast</option>
          </select>
        </label>
        <select
          value={partId}
          onChange={(e) => setPartId(e.target.value)}
          aria-label={`Pick ${kind} to add`}
        >
          <option value="">Pick a part…</option>
          {options.map((o) => (
            <option key={o.id} value={o.id} disabled={taken.has(o.id)}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="kit-add"
          disabled={!partId}
          onClick={() => {
            onAdd(kind, partId);
            setPartId("");
          }}
        >
          Add
        </button>
        <button type="button" className="kit-reset" disabled={!dirty} onClick={onReset}>
          Reset kit
        </button>
      </div>
    </div>
  );
}

function KitTotal({
  items,
  currency,
  label = "Kit total",
}: {
  items: ConvertBuyItem[];
  currency: CurrencyCode;
  label?: string;
}) {
  const amounts = items.map((i) => priceForCurrency(i.twinId, currency));
  const priced = amounts.filter((a): a is number => a != null && Number.isFinite(a));
  const missing = amounts.length - priced.length;
  const total = priced.reduce((s, a) => s + a, 0);
  if (items.length === 0) return null;
  return (
    <div className="kit-total">
      <strong>
        {label}: {priced.length ? formatMoney(total, currency) : "—"}
      </strong>
      {missing > 0 && <span className="note"> · some parts unpriced</span>}
    </div>
  );
}

function toggleDisc(list: Discipline[], id: Discipline): Discipline[] {
  if (list.includes(id)) {
    const next = list.filter((x) => x !== id);
    return next.length ? next : list;
  }
  return [...list, id];
}

function emptyDraft(brand: Brand): Omit<NamedSetup, "id"> {
  const mast = catalog.masts.find((m) => m.brand === brand && !m.motorIntegrated);
  const fuse = catalog.fuselages.find((f) => f.brand === brand);
  const front = catalog.fronts.find((f) => f.brand === brand);
  const tail = catalog.tails.find((t) => t.brand === brand);
  return {
    label: "",
    brand,
    mastId: mast?.id ?? "",
    fuseId: fuse?.id ?? "",
    frontId: front?.id ?? "",
    tailId: tail?.id ?? "",
  };
}

function SetupDraft({
  draft,
  onChange,
  onSave,
  onCancel,
  editing,
}: {
  draft: Omit<NamedSetup, "id">;
  onChange: (d: Omit<NamedSetup, "id">) => void;
  onSave: () => void;
  onCancel?: () => void;
  editing?: boolean;
}) {
  const masts = catalog.masts.filter((m) => m.brand === draft.brand);
  const fuses = catalog.fuselages.filter((f) => f.brand === draft.brand);
  const fronts = catalog.fronts.filter((f) => f.brand === draft.brand);
  const tails = catalog.tails.filter((t) => t.brand === draft.brand);

  function setBrand(brand: Brand) {
    onChange({ ...emptyDraft(brand), label: draft.label });
  }

  return (
    <div className="setup-draft">
      <div className="brand-toggle logos-only">
        <button
          type="button"
          className={draft.brand === "axis" ? "on-axis" : ""}
          onClick={() => setBrand("axis")}
          aria-label="Axis"
          aria-pressed={draft.brand === "axis"}
          title="Axis"
        >
          <BrandMark brand="axis" size="md" />
        </button>
        <button
          type="button"
          className={draft.brand === "armstrong" ? "on-arm" : ""}
          onClick={() => setBrand("armstrong")}
          aria-label="Armstrong"
          aria-pressed={draft.brand === "armstrong"}
          title="Armstrong"
        >
          <BrandMark brand="armstrong" size="md" />
        </button>
      </div>
      <div className="field">
        <label>Label</label>
        <input
          value={draft.label}
          placeholder="e.g. Daily wing"
          onChange={(e) => onChange({ ...draft, label: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Mast</label>
        <select
          value={draft.mastId}
          onChange={(e) => onChange({ ...draft, mastId: e.target.value })}
        >
          {masts.map((m) => (
            <option key={m.id} value={m.id}>
              {m.familyOfficial} {m.sizeLabel}
              {m.length_mm != null ? ` · ${m.length_mm} mm` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Fuselage</label>
        <select
          value={draft.fuseId}
          onChange={(e) => onChange({ ...draft, fuseId: e.target.value })}
        >
          {fuses.map((f) => (
            <option key={f.id} value={f.id}>
              {f.sizeLabel}
              {f.fuse_length_mm != null ? ` · ${f.fuse_length_mm} mm` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Front</label>
        <select
          value={draft.frontId}
          onChange={(e) => onChange({ ...draft, frontId: e.target.value })}
        >
          {fronts.map((f) => (
            <option key={f.id} value={f.id}>
              {f.familyOfficial} {f.sizeLabel}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Tail</label>
        <select
          value={draft.tailId}
          onChange={(e) => onChange({ ...draft, tailId: e.target.value })}
        >
          {tails.map((t) => (
            <option key={t.id} value={t.id}>
              {t.familyOfficial} {t.sizeLabel}
            </option>
          ))}
        </select>
      </div>
      <div className="setup-draft-actions">
        <button type="button" className="chip on arm" onClick={onSave}>
          {editing ? "Save changes" : "Save setup into quiver"}
        </button>
        {editing && onCancel && (
          <button type="button" className="chip" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function pickerSummary(title: string, count: number) {
  return (
    <summary>
      {title}{" "}
      <span className="sub">
        {count} in quiver · tap to add
      </span>
    </summary>
  );
}

function PartChip({
  id,
  label,
  selected,
  onToggle,
  title,
}: {
  id: string;
  label: string;
  selected: string[];
  onToggle: (id: string) => void;
  title?: string;
}) {
  const on = selected.includes(id);
  return (
    <button
      type="button"
      className={`chip part-chip${on ? " on" : ""}`}
      onClick={() => onToggle(id)}
      title={title}
      aria-pressed={on}
      aria-label={on ? `${label}, in quiver. Tap to remove` : `${label}, tap to add to quiver`}
    >
      <span className="chip-mark" aria-hidden="true">
        {on ? "✓" : "+"}
      </span>
      {label}
    </button>
  );
}

function PartPicker({
  title,
  kind,
  selected,
  onToggle,
}: {
  title: string;
  kind: "front" | "tail" | "fuse" | "mast";
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState<Brand>("axis");

  if (kind === "front") {
    const families = FRONT_FAMILY_ORDER.filter((id) =>
      catalog.fronts.some((f) => f.familyId === id && f.brand === brand),
    );
    return (
      <details className="picker" open={open} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}>
        {pickerSummary(title, selected.length)}
        <BrandMini brand={brand} onBrand={setBrand} />
        {families.map((fid) => (
          <div key={fid} className="picker-fam">
            <div className="picker-fam-h">
              <BrandMark brand={brand} size="sm" /> {FAMILY_LABEL[fid]}
            </div>
            <div className="chips">
              {catalog.fronts
                .filter((f) => f.familyId === fid && f.brand === brand)
                .map((f) => (
                  <PartChip
                    key={f.id}
                    id={f.id}
                    label={f.sizeLabel}
                    selected={selected}
                    onToggle={onToggle}
                    title={f.area_cm2 != null ? `${f.area_cm2} cm² published area` : undefined}
                  />
                ))}
            </div>
          </div>
        ))}
      </details>
    );
  }

  if (kind === "tail") {
    const families = TAIL_FAMILY_ORDER.filter((id) =>
      catalog.tails.some((t) => t.familyId === id && t.brand === brand),
    );
    return (
      <details className="picker">
        {pickerSummary(title, selected.length)}
        <BrandMini brand={brand} onBrand={setBrand} />
        {families.map((fid) => {
          const sample = catalog.tails.find((t) => t.familyId === fid);
          return (
            <div key={fid} className="picker-fam">
              <div className="picker-fam-h">
                <BrandMark brand={brand} size="sm" /> {sample?.familyOfficial}
              </div>
              <div className="chips">
                {catalog.tails
                  .filter((t) => t.familyId === fid && t.brand === brand)
                  .map((t) => (
                    <PartChip
                      key={t.id}
                      id={t.id}
                      label={t.sizeLabel}
                      selected={selected}
                      onToggle={onToggle}
                    />
                  ))}
              </div>
            </div>
          );
        })}
      </details>
    );
  }

  if (kind === "fuse") {
    return (
      <details className="picker">
        {pickerSummary(title, selected.length)}
        <BrandMini brand={brand} onBrand={setBrand} />
        <div className="chips">
          {catalog.fuselages
            .filter((f) => f.brand === brand)
            .map((f) => (
              <PartChip
                key={f.id}
                id={f.id}
                label={f.sizeLabel}
                selected={selected}
                onToggle={onToggle}
                title={f.fuse_length_mm != null ? `${f.fuse_length_mm} mm` : undefined}
              />
            ))}
        </div>
      </details>
    );
  }

  const families = MAST_FAMILY_ORDER.filter((id) =>
    catalog.masts.some((m) => m.familyId === id && m.brand === brand),
  );
  return (
    <details className="picker">
      {pickerSummary(title, selected.length)}
      <BrandMini brand={brand} onBrand={setBrand} />
      {families.map((fid) => (
        <div key={fid} className="picker-fam">
          <div className="picker-fam-h">
            <BrandMark brand={brand} size="sm" /> {MAST_FAMILY_LABEL[fid]}
          </div>
          <div className="chips">
            {catalog.masts
              .filter((m) => m.familyId === fid && m.brand === brand)
              .map((m) => (
                <PartChip
                  key={m.id}
                  id={m.id}
                  label={m.sizeLabel}
                  selected={selected}
                  onToggle={onToggle}
                />
              ))}
          </div>
        </div>
      ))}
    </details>
  );
}

function BrandMini({ brand, onBrand }: { brand: Brand; onBrand: (b: Brand) => void }) {
  return (
    <div className="chips" style={{ margin: "8px 0" }}>
      <button
        type="button"
        className={`chip logo-chip${brand === "axis" ? " on" : ""}`}
        onClick={() => onBrand("axis")}
        aria-label="Axis"
        aria-pressed={brand === "axis"}
        title="Axis"
      >
        <BrandMark brand="axis" size="sm" />
      </button>
      <button
        type="button"
        className={`chip logo-chip${brand === "armstrong" ? " on arm" : ""}`}
        onClick={() => onBrand("armstrong")}
        aria-label="Armstrong"
        aria-pressed={brand === "armstrong"}
        title="Armstrong"
      >
        <BrandMark brand="armstrong" size="sm" />
      </button>
    </div>
  );
}
