import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getThreads } from "../services/threads.service";
import ThreadItem from "./ThreadItem.jsx";

export default function ThreadList() {
  // Keep track of which page the user is currently viewing.
  const [page, setPage] = useState(1);

  const { data, isPending, isError, error } = useQuery({
    // Page is part of the key so React Query fetches
    // new data when the page changes.
    queryKey: ["threads", page],

    // Pass the current page to our API function.
    queryFn: () => getThreads(page),

    // Keep the previous page visible while the new page loads.
    placeholderData: (previousData) => previousData,
  });

  if (isPending) return <p className="muted">Loading threads…</p>;

  if (isError) {
    return <p className="error">Could not load threads: {error.message}</p>;
  }

  // The API now returns an object, so get the threads from data.threads.
  const threads = data?.threads || [];

  if (threads.length === 0) {
    return <p className="muted">No threads found.</p>;
  }

  return (
    <>
      <ul className="threads">
        {threads.map((thread) => (
          <ThreadItem key={thread.id} thread={thread} />
        ))}
      </ul>

      {/* Pagination controls */}
      <div>
        <button
          onClick={() => setPage((page) => page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        <span> Page {page} </span>

        <button
          onClick={() => setPage((page) => page + 1)}
          disabled={!data?.hasMore}
        >
          Next
        </button>
      </div>
    </>
  );
}