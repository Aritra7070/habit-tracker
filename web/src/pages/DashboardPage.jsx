import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-teal-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl border border-gray-100 p-10 shadow-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm shadow-teal-200">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Welcome{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="mt-2 text-[14px] text-gray-500">
            Build better habits, one day at a time.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => navigate("/habits")}
              className="cursor-pointer w-full rounded-lg bg-gradient-to-b from-teal-500 to-teal-600 px-6 py-3 text-[14px] font-medium text-white shadow-sm shadow-teal-200 transition-all hover:from-teal-600 hover:to-teal-700"
            >
              Track your habits
            </button>
            <button
              onClick={signout}
              className="cursor-pointer w-full rounded-lg border border-gray-200 px-6 py-2.5 text-[13px] text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
