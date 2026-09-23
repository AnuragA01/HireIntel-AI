import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

/* ============================================================
   GET ERROR MESSAGE FROM FASTAPI
============================================================ */

function getErrorMessage(data, fallback) {
  if (!data) {
    return fallback;
  }

  if (typeof data.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item.msg === "string") {
          return item.msg;
        }

        return "Invalid request.";
      })
      .join(", ");
  }

  if (data.detail && typeof data.detail === "object") {
    if (typeof data.detail.message === "string") {
      return data.detail.message;
    }

    if (typeof data.detail.error === "string") {
      return data.detail.error;
    }

    if (typeof data.detail.msg === "string") {
      return data.detail.msg;
    }
  }

  if (typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}


/* ============================================================
   DECODE JWT WITHOUT THROWING ERRORS
============================================================ */

function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") {
    return {
      success: false,
      payload: null,
      error: "Authentication token was not received.",
    };
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    return {
      success: false,
      payload: null,
      error: "Invalid authentication token.",
    };
  }

  try {
    let base64 = parts[1];

    /*
     * JWT uses URL-safe Base64.
     */

    base64 = base64
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    /*
     * Add Base64 padding.
     */

    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    /*
     * Decode token.
     */

    const decoded = atob(base64);

    /*
     * Convert decoded JSON into JavaScript object.
     */

    const payload = JSON.parse(decoded);

    return {
      success: true,
      payload: payload,
      error: "",
    };
  } catch (decodeError) {
    console.error(
      "JWT decode error:",
      decodeError
    );

    return {
      success: false,
      payload: null,
      error: "Unable to read authentication token.",
    };
  }
}


/* ============================================================
   LOGIN COMPONENT
============================================================ */

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  /* ==========================================================
     HANDLE LOGIN
  ========================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim();


    /* ========================================================
       BASIC VALIDATION
    ======================================================== */

    if (!cleanEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }


    setLoading(true);


    try {
      /* ======================================================
         CLEAR OLD SESSION
      ====================================================== */

      localStorage.removeItem(
        "hireintel_token"
      );

      localStorage.removeItem(
        "hireintel_role"
      );

      localStorage.removeItem(
        "hireintel_user_id"
      );

      localStorage.removeItem(
        "hireintel_email"
      );


      /* ======================================================
         CALL LOGIN API
      ====================================================== */

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password: password,
          }),
        }
      );


      /* ======================================================
         READ RESPONSE
      ====================================================== */

      const data = await response
        .json()
        .catch(() => null);


      console.log(
        "Login status:",
        response.status
      );

      console.log(
        "Login response:",
        data
      );


      /* ======================================================
         BACKEND ERROR
      ====================================================== */

      if (!response.ok) {
        const message = getErrorMessage(
          data,
          `Login failed with status ${response.status}.`
        );

        setError(message);
        return;
      }


      /* ======================================================
         GET ACCESS TOKEN
      ====================================================== */

      const accessToken =
        data?.access_token;


      if (
        !accessToken ||
        typeof accessToken !== "string"
      ) {
        setError(
          "Login succeeded, but no authentication token was received."
        );

        return;
      }


      /* ======================================================
         DECODE JWT
      ====================================================== */

      const decodedToken =
        decodeJwtPayload(accessToken);


      if (!decodedToken.success) {
        setError(
          decodedToken.error ||
            "Unable to read authentication token."
        );

        return;
      }


      const payload =
        decodedToken.payload;


      console.log(
        "JWT payload:",
        payload
      );


      /* ======================================================
         GET USER ROLE
      ====================================================== */

      const role =
        payload?.role ||
        payload?.user_role ||
        data?.role ||
        data?.user?.role;


      /* ======================================================
         GET USER ID
      ====================================================== */

      const userId =
        payload?.sub ||
        payload?.user_id ||
        data?.user?.id;


      console.log(
        "Logged-in role:",
        role
      );

      console.log(
        "Logged-in user ID:",
        userId
      );


      /* ======================================================
         CHECK ROLE
      ====================================================== */

      if (
        role !== "candidate" &&
        role !== "recruiter"
      ) {
        setError(
          "Login succeeded, but the account role could not be determined."
        );

        return;
      }


      /* ======================================================
         SAVE LOGIN SESSION
      ====================================================== */

      localStorage.setItem(
        "hireintel_token",
        accessToken
      );

      localStorage.setItem(
        "hireintel_role",
        role
      );

      localStorage.setItem(
        "hireintel_email",
        cleanEmail
      );


      if (
        userId !== undefined &&
        userId !== null
      ) {
        localStorage.setItem(
          "hireintel_user_id",
          String(userId)
        );
      }


      /* ======================================================
         REDIRECT
      ====================================================== */

      if (role === "candidate") {
        navigate(
          "/candidate/dashboard",
          {
            replace: true,
          }
        );

        return;
      }


      if (role === "recruiter") {
        navigate(
          "/recruiter/dashboard",
          {
            replace: true,
          }
        );

        return;
      }

    } catch (loginError) {
      console.error(
        "HireIntel login error:",
        loginError
      );

      setError(
        loginError?.message ||
          "Unable to connect to the HireIntel AI server."
      );
    } finally {
      setLoading(false);
    }
  };


  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="login-page">

      <div className="login-background"></div>


      <div className="login-card">


        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="login-brand">

          <div className="login-logo">
            H
          </div>

          <div className="login-brand-name">
            HireIntel <span>AI</span>
          </div>

        </div>


        {/* ==================================================
            HEADING
        ================================================== */}

        <div className="login-heading">

          <h1>
            Welcome back
          </h1>

          <p>
            Sign in to continue to your
            HireIntel AI account.
          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="login-error"
            role="alert"
          >
            {error}
          </div>
        )}


        {/* ==================================================
            FORM
        ================================================== */}

        <form onSubmit={handleLogin}>


          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(
                  event.target.value
                );

                if (error) {
                  setError("");
                }
              }}
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* ==================================================
            TEST ACCOUNTS
        ================================================== */}

        <div
          style={{
            marginTop: "20px",
            padding: "14px",
            borderRadius: "12px",
            background: "#f7f5ff",
            border: "1px solid #e7e1ff",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >

          <strong>
            Test Accounts
          </strong>


          <div
            style={{
              marginTop: "8px",
            }}
          >

            <strong>
              Candidate
            </strong>

            <br />

            Email:
            candidate1@example.com

            <br />

            Password:
            Test123456

          </div>


          <div
            style={{
              marginTop: "10px",
            }}
          >

            <strong>
              Recruiter
            </strong>

            <br />

            Email:
            recruiter1@example.com

            <br />

            Password:
            Recruiter123

          </div>

        </div>


        {/* ==================================================
            REGISTER
        ================================================== */}

        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create account
          </Link>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="login-footer">

          Secure authentication powered by HireIntel AI

        </div>

      </div>

    </div>
  );
}

export default Login;