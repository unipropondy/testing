const { sql } = require("../config/db");

exports.login = async (req, res) => {
  try {
    let { username, password } = req.body;
    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username and Password are required" });
    }

    const pool = req.pool;
    console.log(`🔐 Login attempt for: ${username}`);
    
    const result = await pool.request()
      .input("username", sql.VarChar(100), username)
      .query(`
        SELECT 
          UserId, UserCode, UserName, UserPassword, UserGroupid, 
          Salutation, FirstName, LastName, FullName, NickName, 
          IdentificationNo, IsDisabled, CreatedBy, CreatedOn, 
          ModifiedBy, ModifiedOn, CardNumber, isWaiter, 
          DailyVoidLimit, DailyCancelLimit, LastLogInDate, 
          CurrentVoidAmount, CurrentCancelAmount 
        FROM USERMASTER
        WHERE UserName = @username
      `);

    if (result.recordset.length === 0) {
      console.log("❌ Login failed: Username not found");
      return res.status(401).json({ success: false, message: "Username not found" });
    }

    const user = result.recordset[0];
    
    // Check both plain text and Base64 encoded version
    const providedPassword = password.trim();
    const dbPassword = user.UserPassword?.trim();
    const base64Password = Buffer.from(providedPassword).toString('base64');

    if (dbPassword !== providedPassword && dbPassword !== base64Password) {
      console.log("❌ Login failed: Password mismatch");
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    if (user.IsDisabled) {
      return res.status(403).json({ success: false, message: "Account is disabled" });
    }

    console.log(`✅ Login successful: ${username}`);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        userId: user.UserId,
        userCode: user.UserCode,
        userName: user.UserName,
        fullName: user.FullName,
        userGroupId: user.UserGroupid,
        isWaiter: user.isWaiter,
        cardNumber: user.CardNumber
      }
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};
