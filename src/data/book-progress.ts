export type BookReadingProgress = {
  currentChapterIndex: number;
  completedThrough: number;
};

export type BookQuizResponse = {
  value: string;
  correct: boolean;
};

export type BookQuizAttempt = {
  name: string;
  responses: BookQuizResponse[];
  completed: boolean;
};

function getStorageKey(kind: "reading" | "quiz", bookId: string) {
  return `atelier:${kind}:${bookId}:v1`;
}

export function getBookReadingProgress(
  bookId: string,
  chapterCount: number,
): BookReadingProgress {
  const saved = localStorage.getItem(getStorageKey("reading", bookId));
  if (!saved) {
    return { currentChapterIndex: 0, completedThrough: -1 };
  }

  let progress: unknown;
  try {
    progress = JSON.parse(saved);
  } catch {
    throw new Error("La progression de lecture enregistrée est illisible.");
  }

  if (
    typeof progress !== "object" ||
    progress === null ||
    !("currentChapterIndex" in progress) ||
    !("completedThrough" in progress) ||
    typeof progress.currentChapterIndex !== "number" ||
    typeof progress.completedThrough !== "number" ||
    !Number.isInteger(progress.currentChapterIndex) ||
    !Number.isInteger(progress.completedThrough) ||
    progress.currentChapterIndex < 0 ||
    progress.currentChapterIndex >= chapterCount ||
    progress.completedThrough < -1 ||
    progress.completedThrough >= chapterCount ||
    progress.currentChapterIndex > progress.completedThrough + 1
  ) {
    throw new Error("La progression de lecture enregistrée est invalide.");
  }

  return {
    currentChapterIndex: progress.currentChapterIndex,
    completedThrough: progress.completedThrough,
  };
}

export function saveBookReadingProgress(
  bookId: string,
  progress: BookReadingProgress,
) {
  localStorage.setItem(
    getStorageKey("reading", bookId),
    JSON.stringify(progress),
  );
}

export function getBookQuizAttempt(bookId: string): BookQuizAttempt | null {
  const saved = localStorage.getItem(getStorageKey("quiz", bookId));
  if (!saved) return null;

  let attempt: unknown;
  try {
    attempt = JSON.parse(saved);
  } catch {
    throw new Error("Les réponses enregistrées au test sont illisibles.");
  }

  if (
    typeof attempt !== "object" ||
    attempt === null ||
    !("name" in attempt) ||
    typeof attempt.name !== "string" ||
    !("responses" in attempt) ||
    !Array.isArray(attempt.responses) ||
    !("completed" in attempt) ||
    typeof attempt.completed !== "boolean" ||
    !attempt.responses.every(
      (response) =>
        typeof response === "object" &&
        response !== null &&
        "value" in response &&
        typeof response.value === "string" &&
        "correct" in response &&
        typeof response.correct === "boolean",
    )
  ) {
    throw new Error("Les réponses enregistrées au test sont invalides.");
  }

  return {
    name: attempt.name,
    responses: attempt.responses,
    completed: attempt.completed,
  };
}

export function saveBookQuizAttempt(bookId: string, attempt: BookQuizAttempt) {
  localStorage.setItem(
    getStorageKey("quiz", bookId),
    JSON.stringify(attempt),
  );
}
