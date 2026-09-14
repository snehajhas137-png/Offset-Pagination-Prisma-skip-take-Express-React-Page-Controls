import { Router } from "express";
import prisma from "../prisma/client.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    // Get the page number from the URL: /api/threads?page=2
    // If no page is provided, use page 1.
    const page = Number(req.query.page) || 1;

    // Show 10 threads per page.
    const PAGE_SIZE = 10;

    // Calculate how many threads to skip.
    // Page 1 → 0, Page 2 → 10, Page 3 → 20
    const skip = (page - 1) * PAGE_SIZE;

    // Number of threads to fetch for each page.
    const take = PAGE_SIZE;

    // Get current page's threads and total thread count together.
    const [threads, total] = await Promise.all([
      prisma.thread.findMany({
        skip, // Skip threads from previous pages
        take, // Get only 10 threads

        orderBy: { createdAt: "desc" },

        include: {
          author: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),

      // Get total number of threads for pagination.
      prisma.thread.count(),
    ]);

    // Check if there are more threads after the current page.
    const hasMore = skip + threads.length < total;

    // Send pagination information to React.
    res.json({
      threads,
      total,
      hasMore,
    });
  } catch (error) {
    next(error);
  }
});

export default router;