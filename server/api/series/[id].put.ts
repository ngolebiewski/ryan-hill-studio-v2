// server/api/series/[id].put.ts
import { pool } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  // Extract potential update fields
  const { title, description, parent_id, order_index } = body;

  console.log(`🔄 [API] Updating Series ID: ${id}`);

  try {
    // Generate new slug if title changed
    let slug = undefined;
    if (title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
    }

    const res = await pool.query(
      `UPDATE series 
   SET 
     title = COALESCE($1, title),
     description = $2, -- We allow setting this to null/empty explicitly
     parent_id = COALESCE($3, parent_id), -- FIX: Keep existing parent if not provided
     order_index = COALESCE($4, order_index),
     slug = COALESCE($5, slug)
   WHERE id = $6
   RETURNING *`,
      [title, description, parent_id, order_index, slug, id],
    );

    if (res.rowCount === 0) {
      throw createError({ statusCode: 404, statusMessage: "Series not found" });
    }

    return res.rows[0];
  } catch (err) {
    console.error("❌ [API] Series Update Error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Database Error during update",
    });
  }
});
