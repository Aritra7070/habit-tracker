import { useState } from "react";
import { useHabits } from "../hooks/useHabits";
import { useNotes } from "../hooks/useNotes";
import HabitCard from "../components/HabitCard";
import HabitModal from "../components/HabitModal";
import DeleteConfirm from "../components/DeleteConfirm";
import NotesPanel from "../components/NotesPanel";
import HabitFilterBar from "../components/HabitFilterBar";
import { filterAndSort } from "../utils/filterSortHabits";

export default function Habits() {
  const { habits, isLoading, error, createHabit, updateHabit, deleteHabit, toggleCompletion } =
    useHabits();
  const { notes, isLoading: notesLoading, createNote, deleteNote } = useNotes();

  const [modalHabit, setModalHabit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', sortBy: 'default' });

  function openCreate() {
    setModalHabit(null);
    setShowModal(true);
  }

  function openEdit(habit) {
    setModalHabit(habit);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setModalHabit(null);
  }

  // Derive filtered+sorted list
  const visibleHabits = filterAndSort(habits, filters);

  async function handleSave(data) {
    if (modalHabit) await updateHabit(modalHabit._id, data);
    else await createHabit(data);
  }

  async function handleDelete() {
    await deleteHabit(deleteTarget._id);
    setDeleteTarget(null);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-accent-200 border-t-accent-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-surface-800">My Habits</h1>
          <p className="mt-1 text-[13px] text-surface-400">
            {habits.length} habit{habits.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <button
          onClick={openCreate}
          className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-[13px] font-medium text-white shadow-sm shadow-accent-200 transition-colors hover:bg-accent-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New habit
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-danger-400/20 bg-danger-400/10 px-4 py-2.5 text-[13px] text-danger-500">
          {error}
        </div>
      )}

      <div className="flex gap-5">
        <div className="min-w-0 flex-[7]">
          {habits.length === 0 ? (
            <EmptyHabits onAdd={openCreate} />
          ) : (
            <>
              <HabitFilterBar filters={filters} onChange={setFilters} />
              {visibleHabits.length === 0 && habits.length > 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">No habits match this filter.</p>
                  <button
                    onClick={() => setFilters({ status: 'all', sortBy: 'default' })}
                    className="mt-2 text-xs text-purple-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {visibleHabits.map((h) => (
                    <HabitCard
                      key={h._id}
                      habit={h}
                      onToggleToday={toggleCompletion}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="min-w-0 flex-[3]">
          <NotesPanel notes={notes} isLoading={notesLoading} onCreate={createNote} onDelete={deleteNote} />
        </div>
      </div>

      {showModal && <HabitModal habit={modalHabit} onSave={handleSave} onClose={closeModal} />}
      {deleteTarget && (
        <DeleteConfirm
          habitName={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function EmptyHabits({ onAdd }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-100">
        <svg className="h-6 w-6 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </div>
      <p className="mb-1 text-[14px] font-medium text-surface-600">No habits yet</p>
      <p className="mb-4 text-[12px] text-surface-400">Start building your routine by adding your first habit.</p>
      <button
        onClick={onAdd}
        className="cursor-pointer text-[13px] font-medium text-accent-600 transition-colors hover:text-accent-700"
      >
        Create your first habit
      </button>
    </div>
  );
}
