exports.getTodayOrders = async (req, res) => {
  try {
    const pool = req.pool;
    const result = await pool.request().query(`
      SELECT 
        o.OrderId,
        o.OrderNumber,
        o.Tableno,
        o.OrderDateTime,
        CASE 
          WHEN MIN(CAST(ISNULL(d.isReady, 0) AS INT)) = 1 
          THEN 'READY'
          ELSE 'PREPARING'
        END AS StatusLabel
      FROM RestaurantOrderCur o
      INNER JOIN RestaurantOrderDetailCur d 
         ON o.OrderId = d.OrderId
      WHERE ISNULL(d.isDelivered, 0) = 0
      GROUP BY 
        o.OrderId, o.OrderNumber, o.Tableno, o.OrderDateTime
      ORDER BY o.OrderDateTime ASC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error("🔥 CDS ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
