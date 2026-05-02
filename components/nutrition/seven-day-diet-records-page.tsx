"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

import styles from "./seven-day-diet-records.module.css";
import { CalculatorSuggestionPanel } from "./calculator-suggestion-panel";
import { NutritionSiteNavigation } from "./site-navigation";
import {
  DIET_RECORD_CATEGORIES,
  DIET_RECORD_MEALS,
  buildAutoCaloriesValue,
  clearDietWeekRecordsStorage,
  createEmptyDietFoodEntry,
  createEmptyDietWeekRecords,
  exportDietWeekRecords,
  getDietCategoryMeta,
  loadDietWeekRecords,
  sanitizeNumericInput,
  saveDietWeekRecords,
  summarizeDietDay,
  summarizeDietWeek,
  validateDietFoodEntry,
  type DietFoodCategoryId,
  type DietFoodEntry,
  type DietMealId,
  type DietRecordExportFormat,
  type DietWeekRecords,
} from "@/lib/diet-records";
import {
  buildDietCategoryCoverage,
  buildDietWeeklyReview,
} from "@/lib/diet-record-insights";
import { exportDietComparisonPdf } from "@/lib/diet-record-pdf-export";
import { loadNutritionProfile } from "@/lib/nutrition-profile-store";
import {
  GOAL_OPTIONS,
  calculateRecommendedCalories,
  type UserProfile,
} from "@/lib/nutrition-calculator";

function buildMotionStyle(delayMs: number): CSSProperties {
  return {
    "--motion-delay": `${delayMs}ms`,
  } as CSSProperties;
}

function getDraftKey(dayIndex: number, mealId: DietMealId) {
  return `${dayIndex}:${mealId}`;
}

function createMealDraftMap() {
  const drafts: Record<string, DietFoodEntry> = {};

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    for (const meal of DIET_RECORD_MEALS) {
      drafts[getDraftKey(dayIndex, meal.id)] = createEmptyDietFoodEntry();
    }
  }

  return drafts;
}

function formatCalories(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function formatDayDate(date: string) {
  if (!date) {
    return "未設定日期";
  }

  const parts = date.split("-");

  if (parts.length !== 3) {
    return date;
  }

  return `${Number(parts[1])}/${Number(parts[2])}`;
}

function formatSignedCalories(value: number) {
  const rounded = Math.round(Math.abs(value)).toLocaleString("en-US");
  return value >= 0 ? `+${rounded} kcal` : `-${rounded} kcal`;
}

function getComparisonStatus(delta: number) {
  if (Math.abs(delta) <= 150) {
    return {
      tone: "aligned" as const,
      label: "接近建議值",
      shortLabel: "接近建議",
    };
  }

  if (delta > 0) {
    return {
      tone: "over" as const,
      label: `高於建議 ${Math.round(delta).toLocaleString("en-US")} kcal`,
      shortLabel: `高 ${Math.round(delta).toLocaleString("en-US")} kcal`,
    };
  }

  return {
    tone: "under" as const,
    label: `低於建議 ${Math.round(Math.abs(delta)).toLocaleString("en-US")} kcal`,
    shortLabel: `低 ${Math.round(Math.abs(delta)).toLocaleString("en-US")} kcal`,
  };
}

type EditableDietFoodField = keyof Pick<
  DietFoodEntry,
  "name" | "amount" | "category" | "note"
>;

function buildEntryWithAutoCalories(
  entry: DietFoodEntry,
  field: EditableDietFoodField,
  value: string,
): DietFoodEntry {
  const nextAmount =
    field === "amount" ? sanitizeNumericInput(value) : sanitizeNumericInput(entry.amount);
  const nextCategory: DietFoodCategoryId =
    field === "category" ? (value as DietFoodCategoryId) : entry.category;

  return {
    ...entry,
    [field]: field === "amount" ? nextAmount : value,
    category: nextCategory,
    amount: nextAmount,
    calories: buildAutoCaloriesValue(nextCategory, nextAmount),
  };
}

export function SevenDayDietRecordsPage() {
  const [weekRecords, setWeekRecords] = useState<DietWeekRecords>(() =>
    createEmptyDietWeekRecords(),
  );
  const [mealDrafts, setMealDrafts] = useState<Record<string, DietFoodEntry>>(() =>
    createMealDraftMap(),
  );
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [nutritionProfile, setNutritionProfile] = useState<UserProfile | null>(null);
  const [exportingComparisonPdf, setExportingComparisonPdf] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
    const storedRecords = loadDietWeekRecords();

    if (storedRecords) {
      setWeekRecords(storedRecords);
    }

    setNutritionProfile(loadNutritionProfile());
    setMealDrafts(createMealDraftMap());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveDietWeekRecords(weekRecords);
  }, [weekRecords, isReady]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const daySummaries = useMemo(
    () => weekRecords.map((record) => summarizeDietDay(record)),
    [weekRecords],
  );
  const weekSummary = useMemo(() => summarizeDietWeek(weekRecords), [weekRecords]);
  const activeDayRecord = weekRecords[activeDayIndex];
  const activeDaySummary = daySummaries[activeDayIndex];
  const targetCalories =
    nutritionProfile !== null
      ? calculateRecommendedCalories(nutritionProfile.weightKg, nutritionProfile.goal)
      : null;
  const weeklyRecommendedCalories =
    targetCalories !== null ? targetCalories * weekRecords.length : null;
  const activeDayDelta =
    targetCalories !== null ? activeDaySummary.totalCalories - targetCalories : null;
  const activeDayStatus =
    activeDayDelta !== null ? getComparisonStatus(activeDayDelta) : null;
  const goalLabel =
    nutritionProfile !== null
      ? GOAL_OPTIONS.find((option) => option.value === nutritionProfile.goal)?.label ?? "維持"
      : null;
  const trackedDays =
    targetCalories !== null
      ? weekSummary.dailyTotals.filter((day) => day.totalCalories > 0)
      : [];
  const trackedDaysCount = trackedDays.length;
  const daysNearTarget =
    targetCalories !== null
      ? trackedDays.filter(
          (day) => Math.abs(day.totalCalories - targetCalories) <= 150,
        ).length
      : 0;
  const daysOverTarget =
    targetCalories !== null
      ? trackedDays.filter((day) => day.totalCalories - targetCalories > 150).length
      : 0;
  const daysUnderTarget =
    targetCalories !== null
      ? trackedDays.filter((day) => targetCalories - day.totalCalories > 150).length
      : 0;
  const categoryCoverage = useMemo(
    () => buildDietCategoryCoverage(daySummaries, trackedDaysCount),
    [daySummaries, trackedDaysCount],
  );
  const weeklyReview = useMemo(
    () =>
      buildDietWeeklyReview({
        weekSummary,
        trackedDaysCount,
        targetCalories,
        daysNearTarget,
        daysOverTarget,
        daysUnderTarget,
        categoryCoverage,
      }),
    [
      weekSummary,
      trackedDaysCount,
      targetCalories,
      daysNearTarget,
      daysOverTarget,
      daysUnderTarget,
      categoryCoverage,
    ],
  );
  const weekDelta =
    targetCalories !== null && weeklyRecommendedCalories !== null
      ? weekSummary.totalCalories - weeklyRecommendedCalories
      : null;
  const maxWeekCalories = Math.max(
    ...weekSummary.dailyTotals.map((day) => day.totalCalories),
    targetCalories ?? 0,
    1,
  );

  function getStatusClassName(tone: "aligned" | "over" | "under") {
    switch (tone) {
      case "aligned":
        return styles.compareBadgeAligned;
      case "over":
        return styles.compareBadgeOver;
      case "under":
        return styles.compareBadgeUnder;
    }
  }

  function getReminderCardClassName(status: "good" | "watch" | "low" | "missing") {
    switch (status) {
      case "good":
        return styles.reminderGood;
      case "watch":
        return styles.reminderWatch;
      case "low":
        return styles.reminderLow;
      case "missing":
        return styles.reminderMissing;
    }
  }

  function getReviewToneClassName(tone: "balanced" | "over" | "under" | "incomplete") {
    switch (tone) {
      case "balanced":
        return styles.reviewBalanced;
      case "over":
        return styles.reviewOver;
      case "under":
        return styles.reviewUnder;
      case "incomplete":
        return styles.reviewIncomplete;
    }
  }

  function setFeedbackMessage(text: string, isError = false) {
    setFeedback({ text, isError });
  }

  function updateMealDraft(
    mealId: DietMealId,
    field: EditableDietFoodField,
    value: string,
  ) {
    const key = getDraftKey(activeDayIndex, mealId);

    setMealDrafts((current) => ({
      ...current,
      [key]: buildEntryWithAutoCalories(current[key], field, value),
    }));
  }

  function updateDayRecord(
    updater: (dayRecord: DietWeekRecords[number]) => DietWeekRecords[number],
  ) {
    setWeekRecords((current) =>
      current.map((dayRecord, index) =>
        index === activeDayIndex ? updater(dayRecord) : dayRecord,
      ),
    );
  }

  function handleDayDateChange(value: string) {
    updateDayRecord((dayRecord) => ({
      ...dayRecord,
      date: value,
    }));
  }

  function handleAddFood(mealId: DietMealId) {
    const key = getDraftKey(activeDayIndex, mealId);
    const draft = mealDrafts[key];
    const errors = validateDietFoodEntry(draft);

    if (errors.length > 0) {
      setFeedbackMessage(`${errors[0]}，無法新增到 ${DIET_RECORD_MEALS.find((meal) => meal.id === mealId)?.label ?? mealId}。`, true);
      return;
    }

    const nextEntry: DietFoodEntry = {
      ...draft,
      id: createEmptyDietFoodEntry().id,
    };

    updateDayRecord((dayRecord) => ({
      ...dayRecord,
      meals: {
        ...dayRecord.meals,
        [mealId]: [...dayRecord.meals[mealId], nextEntry],
      },
    }));

    setMealDrafts((current) => ({
      ...current,
      [key]: createEmptyDietFoodEntry(),
    }));

    setFeedbackMessage("已新增食物，熱量與分類統計已同步更新。");
  }

  function handleItemFieldChange(
    mealId: DietMealId,
    itemId: string,
    field: EditableDietFoodField,
    value: string,
  ) {
    updateDayRecord((dayRecord) => ({
      ...dayRecord,
      meals: {
        ...dayRecord.meals,
        [mealId]: dayRecord.meals[mealId].map((item) =>
          item.id === itemId
            ? buildEntryWithAutoCalories(item, field, value)
            : item,
        ),
      },
    }));
  }

  function handleSaveItem(mealId: DietMealId, itemId: string) {
    const item = activeDayRecord.meals[mealId].find((food) => food.id === itemId);

    if (!item) {
      return;
    }

    const errors = validateDietFoodEntry(item);

    if (errors.length > 0) {
      setFeedbackMessage(errors[0], true);
      return;
    }

    saveDietWeekRecords(weekRecords);
    setFeedbackMessage("這筆食物已儲存到本機紀錄。");
  }

  function handleClearItem(mealId: DietMealId, itemId: string) {
    updateDayRecord((dayRecord) => ({
      ...dayRecord,
      meals: {
        ...dayRecord.meals,
        [mealId]: dayRecord.meals[mealId].map((item) =>
          item.id === itemId
            ? {
                ...createEmptyDietFoodEntry(),
                id: itemId,
              }
            : item,
        ),
      },
    }));

    setFeedbackMessage("這筆食物已清空，可重新填寫或直接刪除。");
  }

  function handleDeleteItem(mealId: DietMealId, itemId: string) {
    updateDayRecord((dayRecord) => ({
      ...dayRecord,
      meals: {
        ...dayRecord.meals,
        [mealId]: dayRecord.meals[mealId].filter((item) => item.id !== itemId),
      },
    }));

    setFeedbackMessage("這筆食物已刪除。");
  }

  function handleSaveAll() {
    saveDietWeekRecords(weekRecords);
    setFeedbackMessage("本週飲食紀錄已儲存到本機。");
  }

  function handleLoadRecords() {
    const storedRecords = loadDietWeekRecords();

    if (!storedRecords) {
      setFeedbackMessage("目前找不到已儲存的本週紀錄。", true);
      return;
    }

    setWeekRecords(storedRecords);
    setMealDrafts(createMealDraftMap());
    setActiveDayIndex(0);
    setFeedbackMessage("已載入本機的七天飲食紀錄。");
  }

  function handleClearWeek() {
    if (typeof window !== "undefined") {
      const shouldClear = window.confirm("確定要清除這一週的飲食紀錄嗎？");

      if (!shouldClear) {
        return;
      }
    }

    const emptyRecords = createEmptyDietWeekRecords();
    clearDietWeekRecordsStorage();
    setWeekRecords(emptyRecords);
    setMealDrafts(createMealDraftMap());
    setActiveDayIndex(0);
    setFeedbackMessage("本週紀錄已清除。");
  }

  function handleExport(format: DietRecordExportFormat) {
    try {
      const filename = exportDietWeekRecords(format, weekRecords);
      setFeedbackMessage(`已匯出 ${filename}`);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "匯出失敗，請稍後再試。",
        true,
      );
    }
  }

  async function handleExportComparisonPdf() {
    setExportingComparisonPdf(true);

    try {
      const filename = await exportDietComparisonPdf({
        nutritionProfile,
        targetCalories,
        trackedDaysCount,
        daysNearTarget,
        daysOverTarget,
        daysUnderTarget,
        weekDelta,
        weekSummary,
        categoryCoverage,
        weeklyReview,
      });

      setFeedbackMessage(`已匯出 ${filename}`);
    } catch (error) {
      setFeedbackMessage(
        error instanceof Error ? error.message : "PDF 匯出失敗，請稍後再試。",
        true,
      );
    } finally {
      setExportingComparisonPdf(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} />
      <NutritionSiteNavigation />

      <section className={styles.hero}>
        <div className={styles.heroBadge}>7-Day Food Journal</div>
        <h1 className={styles.title}>七天飲食紀錄</h1>
        <p className={styles.description}>
          記錄每日三餐、點心與宵夜，了解自己的熱量與六大類食物攝取狀況。
        </p>

        <div className={styles.heroStats}>
          <article className={styles.heroStat} style={buildMotionStyle(120)}>
            <span>七天總熱量</span>
            <strong>{formatCalories(weekSummary.totalCalories)} kcal</strong>
            <p>每天紀錄會自動累加成一週總量。</p>
          </article>
          <article className={styles.heroStat} style={buildMotionStyle(190)}>
            <span>平均每日熱量</span>
            <strong>{formatCalories(weekSummary.averageCalories)} kcal</strong>
            <p>以七天總熱量 ÷ 7 計算。</p>
          </article>
          <article className={styles.heroStat} style={buildMotionStyle(260)}>
            <span>每日建議熱量</span>
            <strong>
              {targetCalories !== null ? `${formatCalories(targetCalories)} kcal` : "尚未設定"}
            </strong>
            <p>
              {nutritionProfile
                ? `依 ${nutritionProfile.weightKg} kg / ${goalLabel} 目標估算。`
                : "尚未找到計算器個人資料，請先回到飲食計算器填寫。"}
            </p>
          </article>
          <article className={styles.heroStat} style={buildMotionStyle(330)}>
            <span>已記錄食物筆數</span>
            <strong>{weekSummary.totalItems} 筆</strong>
            <p>
              {weekSummary.invalidItems > 0
                ? `目前有 ${weekSummary.invalidItems} 筆欄位需要補正。`
                : "目前沒有需要補正的欄位。"}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.content}>
        <section className={styles.actionCard} style={buildMotionStyle(180)}>
          <div className={styles.actionHeader}>
            <div>
              <span className={styles.eyebrow}>操作區</span>
              <h2>本機儲存與匯出</h2>
            </div>
            <p className={styles.autoSaveHint}>頁面會自動暫存於 localStorage，重新整理後資料不會消失。</p>
          </div>

          <div className={styles.actionToolbar}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleSaveAll}
            >
              儲存紀錄
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleLoadRecords}
            >
              載入紀錄
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleClearWeek}
            >
              清除本週紀錄
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handleExport("json")}
            >
              匯出 JSON
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handleExport("csv")}
            >
              匯出 CSV
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => void handleExportComparisonPdf()}
              disabled={exportingComparisonPdf}
            >
              {exportingComparisonPdf ? "匯出中..." : "七天熱量對比 PDF"}
            </button>
          </div>

          {feedback ? (
            <p className={feedback.isError ? styles.feedbackError : styles.feedback}>
              {feedback.text}
            </p>
          ) : null}
        </section>

        <CalculatorSuggestionPanel />

        <section className={styles.dayCard} style={buildMotionStyle(240)}>
          <div className={styles.dayHeader}>
            <div>
              <span className={styles.eyebrow}>七天切換</span>
              <h2>選擇要記錄的日期</h2>
            </div>
            <label className={styles.dateField}>
              <span>當日日期</span>
              <input
                className={styles.input}
                type="date"
                value={activeDayRecord.date}
                onChange={(event) => handleDayDateChange(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.dayTabs}>
            {weekRecords.map((record, index) => (
              <button
                key={record.day}
                type="button"
                className={
                  index === activeDayIndex ? styles.dayTabActive : styles.dayTab
                }
                onClick={() => setActiveDayIndex(index)}
              >
                <strong>{record.label}</strong>
                <span>{formatDayDate(record.date)}</span>
                <small>{formatCalories(daySummaries[index].totalCalories)} kcal</small>
                {targetCalories !== null && daySummaries[index].totalCalories > 0 ? (
                  <em
                    className={getStatusClassName(
                      getComparisonStatus(daySummaries[index].totalCalories - targetCalories)
                        .tone,
                    )}
                  >
                    {
                      getComparisonStatus(daySummaries[index].totalCalories - targetCalories)
                        .shortLabel
                    }
                  </em>
                ) : null}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.recordsColumn}>
            {DIET_RECORD_MEALS.map((meal, mealIndex) => {
              const draftKey = getDraftKey(activeDayIndex, meal.id);
              const draft = mealDrafts[draftKey];
              const draftErrors = validateDietFoodEntry(draft);
              const isDraftDirty = Boolean(
                draft.name.trim() ||
                  draft.amount.trim() ||
                  draft.calories.trim() ||
                  draft.note.trim(),
              );

              return (
                <article
                  key={meal.id}
                  className={styles.mealCard}
                  style={buildMotionStyle(280 + mealIndex * 60)}
                >
                  <div className={styles.mealHeader}>
                    <div>
                      <span className={styles.eyebrow}>{meal.label}</span>
                      <h3>{meal.label}記錄</h3>
                    </div>
                    <strong className={styles.mealCalories}>
                      {formatCalories(activeDaySummary.mealCalories[meal.id])} kcal
                    </strong>
                  </div>

                  <div className={styles.addForm}>
                    <div className={styles.formGrid}>
                      <label className={styles.field}>
                        <span>食物名稱</span>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="例如：白飯、雞胸肉"
                          value={draft.name}
                          onChange={(event) =>
                            updateMealDraft(meal.id, "name", event.target.value)
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>食物分量（份數）</span>
                        <input
                          className={styles.input}
                          type="text"
                          inputMode="decimal"
                          placeholder="例如：1、0.5、2"
                          value={draft.amount}
                          onChange={(event) =>
                            updateMealDraft(meal.id, "amount", event.target.value)
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>六大類分類</span>
                        <select
                          className={styles.select}
                          value={draft.category}
                          onChange={(event) =>
                            updateMealDraft(meal.id, "category", event.target.value)
                          }
                        >
                          {DIET_RECORD_CATEGORIES.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.field}>
                        <span>熱量 kcal（自動）</span>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="依分類與分量自動換算"
                          value={draft.calories}
                          readOnly
                        />
                      </label>
                    </div>

                    <p className={styles.fieldHint}>
                      分量請輸入阿拉伯數字，例如 1、0.5、2；熱量會依六大類每份熱量自動換算。
                    </p>

                    <label className={styles.field}>
                      <span>備註</span>
                      <textarea
                        className={styles.textarea}
                        rows={2}
                        placeholder="例如：外食、少油、半糖、運動後吃"
                        value={draft.note}
                        onChange={(event) =>
                          updateMealDraft(meal.id, "note", event.target.value)
                        }
                      />
                    </label>

                    <div className={styles.addActions}>
                      <button
                        type="button"
                        className={styles.primaryButton}
                        onClick={() => handleAddFood(meal.id)}
                      >
                        新增食物
                      </button>
                      <button
                        type="button"
                        className={styles.ghostButton}
                        onClick={() =>
                          setMealDrafts((current) => ({
                            ...current,
                            [draftKey]: createEmptyDietFoodEntry(),
                          }))
                        }
                      >
                        清空輸入
                      </button>
                    </div>

                    {isDraftDirty && draftErrors.length > 0 ? (
                      <p className={styles.inlineError}>{draftErrors[0]}</p>
                    ) : null}
                  </div>

                  {activeDayRecord.meals[meal.id].length > 0 ? (
                    <div className={styles.foodList}>
                      {activeDayRecord.meals[meal.id].map((item, itemIndex) => {
                        const categoryMeta = getDietCategoryMeta(item.category);
                        const itemErrors = validateDietFoodEntry(item);

                        return (
                          <article
                            key={item.id}
                            className={
                              itemErrors.length > 0 ? styles.foodRowInvalid : styles.foodRow
                            }
                            style={buildMotionStyle(320 + itemIndex * 45)}
                          >
                            <div className={styles.foodRowHeader}>
                              <div className={styles.foodRowTitle}>
                                <strong>第 {itemIndex + 1} 筆食物</strong>
                                <span
                                  className={styles.categoryBadge}
                                  style={{
                                    color: categoryMeta.color,
                                    backgroundColor: categoryMeta.softColor,
                                  }}
                                >
                                  {categoryMeta.label}
                                </span>
                              </div>
                              <small>{item.calories || "0"} kcal</small>
                            </div>

                            <div className={styles.formGrid}>
                              <label className={styles.field}>
                                <span>食物名稱</span>
                                <input
                                  className={!item.name.trim() ? styles.inputError : styles.input}
                                  type="text"
                                  value={item.name}
                                  onChange={(event) =>
                                    handleItemFieldChange(
                                      meal.id,
                                      item.id,
                                      "name",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className={styles.field}>
                                <span>食物分量（份數）</span>
                                <input
                                  className={styles.input}
                                  type="text"
                                  inputMode="decimal"
                                  placeholder="例如：1、0.5、2"
                                  value={item.amount}
                                  onChange={(event) =>
                                    handleItemFieldChange(
                                      meal.id,
                                      item.id,
                                      "amount",
                                      event.target.value,
                                    )
                                  }
                                />
                              </label>
                              <label className={styles.field}>
                                <span>六大類分類</span>
                                <select
                                  className={styles.select}
                                  value={item.category}
                                  onChange={(event) =>
                                    handleItemFieldChange(
                                      meal.id,
                                      item.id,
                                      "category",
                                      event.target.value,
                                    )
                                  }
                                >
                                  {DIET_RECORD_CATEGORIES.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className={styles.field}>
                                <span>熱量 kcal（自動）</span>
                                <input
                                  className={styles.input}
                                  type="text"
                                  placeholder="依分類與分量自動換算"
                                  value={item.calories}
                                  readOnly
                                />
                              </label>
                            </div>

                            <label className={styles.field}>
                              <span>備註</span>
                              <textarea
                                className={styles.textarea}
                                rows={2}
                                value={item.note}
                                onChange={(event) =>
                                  handleItemFieldChange(
                                    meal.id,
                                    item.id,
                                    "note",
                                    event.target.value,
                                  )
                                }
                              />
                            </label>

                            <div className={styles.rowActions}>
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => handleSaveItem(meal.id, item.id)}
                              >
                                儲存
                              </button>
                              <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={() => handleClearItem(meal.id, item.id)}
                              >
                                清空
                              </button>
                              <button
                                type="button"
                                className={styles.deleteButton}
                                onClick={() => handleDeleteItem(meal.id, item.id)}
                              >
                                刪除
                              </button>
                            </div>

                            {itemErrors.length > 0 ? (
                              <p className={styles.inlineError}>{itemErrors[0]}</p>
                            ) : null}
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.emptyState}>這一餐還沒有新增食物。</p>
                  )}
                </article>
              );
            })}
          </div>

          <aside className={styles.summaryColumn}>
            <section className={styles.summaryCard} style={buildMotionStyle(300)}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.eyebrow}>建議對比</span>
                  <h2>每日建議熱量比較</h2>
                </div>
                <strong className={styles.dailyTotal}>
                  {targetCalories !== null ? `${formatCalories(targetCalories)} kcal` : "--"}
                </strong>
              </div>

              {nutritionProfile && targetCalories !== null && activeDayDelta !== null ? (
                <>
                  <p className={styles.compareMeta}>
                    目前使用 {nutritionProfile.heightCm} cm / {nutritionProfile.weightKg} kg /
                    {goalLabel} 的計算資料，作為這一頁的每日建議熱量基準。
                  </p>

                  <div
                    className={`${styles.compareBanner} ${getStatusClassName(
                      activeDayStatus?.tone ?? "aligned",
                    )}`}
                  >
                    <strong>{activeDayStatus?.label}</strong>
                    <span>今日實際 {formatCalories(activeDaySummary.totalCalories)} kcal</span>
                  </div>

                  <div className={styles.summaryGrid}>
                    <article className={styles.summaryMetric}>
                      <span>建議熱量</span>
                      <strong>{formatCalories(targetCalories)} kcal</strong>
                    </article>
                    <article className={styles.summaryMetric}>
                      <span>實際熱量</span>
                      <strong>{formatCalories(activeDaySummary.totalCalories)} kcal</strong>
                    </article>
                    <article className={styles.summaryMetric}>
                      <span>差值</span>
                      <strong>{formatSignedCalories(activeDayDelta)}</strong>
                    </article>
                    <article className={styles.summaryMetric}>
                      <span>狀態</span>
                      <strong>{activeDayStatus?.shortLabel}</strong>
                    </article>
                  </div>
                </>
              ) : (
                <div className={styles.compareEmpty}>
                  <p>
                    目前還沒有可用的每日建議熱量資料。先到
                    <Link href="/" className={styles.inlineLink}>
                      飲食計算器
                    </Link>
                    填寫身高、體重與目標後，這裡就會自動顯示對比結果。
                  </p>
                </div>
              )}
            </section>

            <section className={styles.summaryCard} style={buildMotionStyle(320)}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.eyebrow}>每日摘要</span>
                  <h2>{activeDayRecord.label} 熱量總覽</h2>
                </div>
                <strong className={styles.dailyTotal}>
                  {formatCalories(activeDaySummary.totalCalories)} kcal
                </strong>
              </div>

              <div className={styles.summaryGrid}>
                <article className={styles.summaryMetric}>
                  <span>今日總熱量</span>
                  <strong>{formatCalories(activeDaySummary.totalCalories)} kcal</strong>
                </article>
                {DIET_RECORD_MEALS.map((meal) => (
                  <article key={meal.id} className={styles.summaryMetric}>
                    <span>{meal.label}</span>
                    <strong>{formatCalories(activeDaySummary.mealCalories[meal.id])} kcal</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.summaryCard} style={buildMotionStyle(390)}>
              <div className={styles.cardHeader}>
                <div>
                  <span className={styles.eyebrow}>六大類統計</span>
                  <h2>今天吃到哪些類別</h2>
                </div>
              </div>

              {activeDaySummary.categoriesConsumed.length > 0 ? (
                <>
                  <div className={styles.badgeList}>
                    {activeDaySummary.categoriesConsumed.map((category) => (
                      <span
                        key={category.categoryId}
                        className={styles.categoryBadge}
                        style={{
                          color: category.color,
                          backgroundColor: category.softColor,
                        }}
                      >
                        {category.label}
                      </span>
                    ))}
                  </div>

                  <div className={styles.categoryList}>
                    {activeDaySummary.categoryStats
                      .filter((category) => category.count > 0)
                      .map((category, index) => (
                        <article
                          key={category.categoryId}
                          className={styles.categoryCard}
                          style={buildMotionStyle(430 + index * 50)}
                        >
                          <div className={styles.categoryCardHeader}>
                            <strong>{category.label}</strong>
                            <span
                              className={styles.categoryDot}
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                          <p>{category.count} 筆食物</p>
                          <small>{formatCalories(category.totalCalories)} kcal</small>
                        </article>
                      ))}
                  </div>
                </>
              ) : (
                <p className={styles.emptyState}>今天尚未記錄六大類食物。</p>
              )}
            </section>
          </aside>
        </section>

        <section className={styles.weekCard} style={buildMotionStyle(460)}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.eyebrow}>七天總覽</span>
              <h2>一週熱量與分類統計</h2>
            </div>
          </div>

          <div className={styles.weekStatsGrid}>
            <article className={styles.weekStat}>
              <span>七天總熱量</span>
              <strong>{formatCalories(weekSummary.totalCalories)} kcal</strong>
            </article>
            <article className={styles.weekStat}>
              <span>平均每日熱量</span>
              <strong>{formatCalories(weekSummary.averageCalories)} kcal</strong>
            </article>
            <article className={styles.weekStat}>
              <span>熱量最高的一天</span>
              <strong>
                {weekSummary.highestDay
                  ? `${weekSummary.highestDay.label} ・ ${formatCalories(
                      weekSummary.highestDay.totalCalories,
                    )} kcal`
                  : "尚未開始"}
              </strong>
            </article>
            <article className={styles.weekStat}>
              <span>熱量最低的一天</span>
              <strong>
                {weekSummary.lowestDay
                  ? `${weekSummary.lowestDay.label} ・ ${formatCalories(
                      weekSummary.lowestDay.totalCalories,
                    )} kcal`
                  : "尚未開始"}
              </strong>
            </article>
          </div>

          {targetCalories !== null && weeklyRecommendedCalories !== null && weekDelta !== null ? (
            <div className={styles.weekCompareStrip}>
              <article className={styles.compareMetricCard}>
                <span>七天建議總量</span>
                <strong>{formatCalories(weeklyRecommendedCalories)} kcal</strong>
              </article>
              <article className={styles.compareMetricCard}>
                <span>與建議總量差距</span>
                <strong>{formatSignedCalories(weekDelta)}</strong>
              </article>
              <article className={styles.compareMetricCard}>
                <span>接近建議天數</span>
                <strong>
                  {trackedDaysCount > 0
                    ? `${daysNearTarget} / ${trackedDaysCount} 天`
                    : "尚未有熱量紀錄"}
                </strong>
              </article>
              <article className={styles.compareMetricCard}>
                <span>整體提醒</span>
                <strong>
                  {trackedDaysCount === 0
                    ? "尚無足夠資料"
                    : daysOverTarget > daysUnderTarget
                    ? "本週偏高"
                    : daysUnderTarget > daysOverTarget
                      ? "本週偏低"
                      : "本週接近平衡"}
                </strong>
              </article>
            </div>
          ) : (
            <div className={styles.weekCompareEmpty}>
              尚未設定每日建議熱量，因此本週對比提醒暫時無法計算。
            </div>
          )}

          {targetCalories !== null ? (
            <p className={styles.compareHint}>
              對比規則：每日實際熱量與建議熱量相差在 ±150 kcal 內，視為接近建議值。
            </p>
          ) : null}

          <div className={styles.insightGrid}>
            <section className={styles.insightCard}>
              <div className={styles.chartHeader}>
                <h3>六大類食物攝取不足提醒</h3>
                <p>優先列出本週最需要補強的類別，讓你知道下週可以從哪裡調整。</p>
              </div>

              <div className={styles.reminderList}>
                {categoryCoverage.map((category, index) => (
                  <article
                    key={category.categoryId}
                    className={`${styles.reminderCard} ${getReminderCardClassName(
                      category.status,
                    )}`}
                    style={buildMotionStyle(600 + index * 40)}
                  >
                    <div className={styles.reminderHeader}>
                      <strong>{category.label}</strong>
                      <span className={getStatusClassName(
                        category.status === "missing"
                          ? "over"
                          : category.status === "low"
                            ? "under"
                            : "aligned",
                      )}>
                        {category.status === "missing"
                          ? "明顯不足"
                          : category.status === "low"
                            ? "偏少"
                            : category.status === "watch"
                              ? "可再補強"
                              : "目前穩定"}
                      </span>
                    </div>
                    <p>{category.message}</p>
                    <small>
                      出現 {category.dayCount} / {category.trackedDaysCount || 7} 天 ・ 累積{" "}
                      {formatCalories(category.totalCalories)} kcal
                    </small>
                    <div className={styles.reminderTip}>建議：{category.recommendation}</div>
                  </article>
                ))}
              </div>
            </section>

            <section
              className={`${styles.insightCard} ${getReviewToneClassName(weeklyReview.tone)}`}
            >
              <div className={styles.chartHeader}>
                <h3>本週飲食評語卡</h3>
                <p>把熱量趨勢、類別分布與下週調整方向整理成一句話與幾個重點。</p>
              </div>

              <div className={styles.reviewCardBody}>
                <div className={styles.reviewLead}>
                  <strong>{weeklyReview.title}</strong>
                  <p>{weeklyReview.summary}</p>
                </div>

                <div className={styles.reviewHighlights}>
                  {weeklyReview.highlights.map((highlight) => (
                    <div key={highlight} className={styles.reviewHighlight}>
                      <span className={styles.reviewDot} />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className={styles.reviewNextStep}>
                  <span>下週建議</span>
                  <strong>{weeklyReview.nextStep}</strong>
                </div>
              </div>
            </section>
          </div>

          <div className={styles.weekCharts}>
            <section className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>每日熱量比較圖</h3>
                <p>可快速看出哪一天吃得較多或較少。</p>
              </div>

              <div className={styles.barList}>
                {weekSummary.dailyTotals.map((day, index) => (
                  <div
                    key={day.day}
                    className={styles.barRow}
                    style={buildMotionStyle(520 + index * 45)}
                  >
                    <div className={styles.barLabel}>
                      <strong>{day.label}</strong>
                      <span>
                        {formatDayDate(day.date)} ・ {formatCalories(day.totalCalories)} kcal
                      </span>
                    </div>
                    <div className={styles.barTrack}>
                      {targetCalories !== null ? (
                        <div
                          className={styles.barTarget}
                          style={{
                            width: `${(targetCalories / maxWeekCalories) * 100}%`,
                          }}
                        />
                      ) : null}
                      <div
                        className={styles.barFill}
                        style={{
                          width: `${(day.totalCalories / maxWeekCalories) * 100}%`,
                        }}
                      />
                    </div>
                    <small>
                      {targetCalories !== null && day.totalCalories > 0
                        ? getComparisonStatus(day.totalCalories - targetCalories).shortLabel
                        : `${formatCalories(day.totalCalories)} kcal`}
                    </small>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h3>七天六大類統計</h3>
                <p>顯示各類別出現次數與總熱量。</p>
              </div>

              <div className={styles.weekCategoryList}>
                {weekSummary.categoryStats.map((category, index) => (
                  <article
                    key={category.categoryId}
                    className={styles.weekCategoryCard}
                    style={buildMotionStyle(560 + index * 45)}
                  >
                    <div className={styles.categoryCardHeader}>
                      <strong>{category.label}</strong>
                      <span
                        className={styles.categoryDot}
                        style={{ backgroundColor: category.color }}
                      />
                    </div>
                    <p>出現 {category.count} 次</p>
                    <small>累積 {formatCalories(category.totalCalories)} kcal</small>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
