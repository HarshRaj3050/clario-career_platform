"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserData } from "@/context/UserDataProvider";
import { UserQuizData } from "@/lib/types/allTypes";

type QuizContextType = {
  quizData: UserQuizData | null;
  loadingQuiz: boolean;
  refreshQuizData: () => Promise<void>;
};

const QuizContext = createContext<QuizContextType>({
  quizData: null,
  loadingQuiz: false,
  refreshQuizData: async () => {},
});

export const QuizDataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useUserData();
  const [quizData, setQuizData] = useState<UserQuizData | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const supabase = createClient();

  const fetchQuizData = async () => {
    if (!user || loading || user?.isQuizDone == false) return;

    setLoadingQuiz(true);
    const { data, error } = await supabase
      .from("userQuizData")
      .select("*")
      .eq("userId", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching quiz data:", error);
      setQuizData(null);
    } else {
      setQuizData(data as UserQuizData);
    }

    setLoadingQuiz(false);
  };

  useEffect(() => {
    fetchQuizData();
  }, [user, loading]);

  return (
    <QuizContext.Provider
      value={{
        quizData,
        loadingQuiz,
        refreshQuizData: fetchQuizData,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuizData = () => useContext(QuizContext);
