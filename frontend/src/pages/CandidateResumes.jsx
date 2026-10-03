import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";


/* ============================================================
   ERROR MESSAGE HELPER
============================================================ */

function getErrorMessage(
  data,
  fallback = "Something went wrong."
) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.msg ||
          item?.message ||
          "Invalid request."
        );
      })
      .join(", ");
  }

  if (data?.detail) {
    return (
      data.detail?.message ||
      data.detail?.error ||
      JSON.stringify(data.detail)
    );
  }

  return fallback;
}


/* ============================================================
   NORMALIZE RESUME DATA
============================================================ */

function normalizeResumes(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((resume) => {
    let score = null;

    /*
      Backend format:

      ai_score: 100

      OR

      analysis:
      {
        score: 100
      }
    */

    if (
      resume?.ai_score !== null &&
      resume?.ai_score !== undefined &&
      resume?.ai_score !== ""
    ) {
      score = Number(resume.ai_score);
    } else if (
      resume?.analysis?.score !== null &&
      resume?.analysis?.score !== undefined &&
      resume?.analysis?.score !== ""
    ) {
      score = Number(
        resume.analysis.score
      );
    }

    return {
      ...resume,

      ai_score:
        Number.isFinite(score)
          ? score
          : null,
    };
  });
}


/* ============================================================
   CANDIDATE RESUMES
============================================================ */

function CandidateResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  /* ==========================================================
     FETCH RESUMES
     
     IMPORTANT:
     This function ONLY fetches data.
     It does NOT call setState.

     This prevents the React cascading-render warning.
  ========================================================== */

  const fetchResumes = async () => {
    const token =
      localStorage.getItem(
        "hireintel_token"
      );

    if (!token) {
      throw new Error(
        "AUTHENTICATION_REQUIRED"
      );
    }

    const response =
      await fetch(
        `${API_BASE_URL}/resumes/my-resumes`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`,

            Accept:
              "application/json",
          },
        }
      );


    const data =
      await response
        .json()
        .catch(() => []);


    /* --------------------------------------------------------
       TOKEN EXPIRED
    -------------------------------------------------------- */

    if (response.status === 401) {
      throw new Error(
        "AUTHENTICATION_REQUIRED"
      );
    }


    /* --------------------------------------------------------
       API ERROR
    -------------------------------------------------------- */

    if (!response.ok) {
      throw new Error(
        getErrorMessage(
          data,
          "Unable to load your resumes."
        )
      );
    }


    /* --------------------------------------------------------
       RETURN NORMALIZED DATA
    -------------------------------------------------------- */

    return normalizeResumes(
      data
    );
  };


  /* ==========================================================
     INITIAL LOAD

     The async function is INSIDE useEffect.

     No external function dependency warning.
     No direct synchronous setState before the request.
  ========================================================== */

  useEffect(() => {
    let cancelled = false;


    const loadInitialResumes =
      async () => {
        try {
          const resumeList =
            await fetchResumes();


          if (cancelled) {
            return;
          }


          setResumes(
            resumeList
          );

        } catch (loadError) {
          if (cancelled) {
            return;
          }


          console.error(
            "Load resumes error:",
            loadError
          );


          if (
            loadError?.message ===
            "AUTHENTICATION_REQUIRED"
          ) {
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

            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }


          setError(
            loadError?.message ||
              "Unable to connect to the HireIntel AI server."
          );

        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };


    loadInitialResumes();


    return () => {
      cancelled = true;
    };

  }, [navigate]);


  /* ==========================================================
     UPLOAD RESUME
  ========================================================== */

  const handleUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];


    /*
      Allow selecting the same file again.
    */

    event.target.value = "";


    if (!file) {
      return;
    }


    /* --------------------------------------------------------
       CHECK LOGIN
    -------------------------------------------------------- */

    const token =
      localStorage.getItem(
        "hireintel_token"
      );


    if (!token) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }


    /* --------------------------------------------------------
       CHECK PDF
    -------------------------------------------------------- */

    const fileName =
      file.name.toLowerCase();


    if (
      !fileName.endsWith(".pdf")
    ) {
      setError(
        "Only PDF resumes are supported."
      );

      setSuccess("");

      return;
    }


    /* --------------------------------------------------------
       CHECK FILE SIZE
       10 MB
    -------------------------------------------------------- */

    const maxSize =
      10 * 1024 * 1024;


    if (file.size > maxSize) {
      setError(
        "Resume file size must be 10 MB or less."
      );

      setSuccess("");

      return;
    }


    try {
      setUploading(true);

      setError("");

      setSuccess("");


      /* ------------------------------------------------------
         FORM DATA
      ------------------------------------------------------ */

      const formData =
        new FormData();


      formData.append(
        "file",
        file
      );


      /* ------------------------------------------------------
         UPLOAD
      ------------------------------------------------------ */

      const response =
        await fetch(
          `${API_BASE_URL}/resumes/upload`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },

            body: formData,
          }
        );


      const data =
        await response
          .json()
          .catch(() => null);


      /* ------------------------------------------------------
         AUTH ERROR
      ------------------------------------------------------ */

      if (
        response.status === 401
      ) {
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


        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      /* ------------------------------------------------------
         UPLOAD ERROR
      ------------------------------------------------------ */

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Resume upload failed."
          )
        );
      }


      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setSuccess(
        "Resume uploaded successfully. AI analysis and job matching completed."
      );


      /*
        IMPORTANT:

        Do NOT trust only the POST response
        for ai_score.

        Fetch the complete resume list again.
      */

      const updatedResumes =
        await fetchResumes();


      setResumes(
        updatedResumes
      );

    } catch (uploadError) {
      console.error(
        "Resume upload error:",
        uploadError
      );


      if (
        uploadError?.message ===
        "AUTHENTICATION_REQUIRED"
      ) {
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


        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      setError(
        uploadError?.message ||
          "Unable to upload resume."
      );

    } finally {
      setUploading(false);
    }
  };


  /* ==========================================================
     DELETE RESUME
  ========================================================== */

  const handleDelete = async (
    resumeId
  ) => {
    const token =
      localStorage.getItem(
        "hireintel_token"
      );


    if (!token) {
      navigate(
        "/login",
        {
          replace: true,
        }
      );

      return;
    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete Resume #${resumeId}?`
      );


    if (!confirmed) {
      return;
    }


    try {
      setDeletingId(
        resumeId
      );

      setError("");

      setSuccess("");


      /* ------------------------------------------------------
         DELETE
      ------------------------------------------------------ */

      const response =
        await fetch(
          `${API_BASE_URL}/resumes/${resumeId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`,

              Accept:
                "application/json",
            },
          }
        );


      const data =
        await response
          .json()
          .catch(() => null);


      /* ------------------------------------------------------
         AUTH ERROR
      ------------------------------------------------------ */

      if (
        response.status === 401
      ) {
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


        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }


      /* ------------------------------------------------------
         DELETE ERROR
      ------------------------------------------------------ */

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            "Unable to delete resume."
          )
        );
      }


      /* ------------------------------------------------------
         UPDATE UI
      ------------------------------------------------------ */

      setResumes(
        (currentResumes) =>
          currentResumes.filter(
            (resume) =>
              Number(resume.id) !==
              Number(resumeId)
          )
      );


      setSuccess(
        `Resume #${resumeId} deleted successfully.`
      );

    } catch (deleteError) {
      console.error(
        "Delete resume error:",
        deleteError
      );


      setError(
        deleteError?.message ||
          "Unable to delete resume."
      );

    } finally {
      setDeletingId(
        null
      );
    }
  };


  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  const formatDate = (
    dateValue
  ) => {
    if (!dateValue) {
      return "—";
    }


    const date =
      new Date(dateValue);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }


    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  /* ==========================================================
     SCORE DISPLAY
  ========================================================== */

  const renderScore = (
    resume
  ) => {
    const score =
      Number(
        resume?.ai_score
      );


    if (
      !Number.isFinite(score)
    ) {
      return "—";
    }


    return `${score.toFixed(0)}%`;
  };


  /* ==========================================================
     SCORE COLOR
  ========================================================== */

  const getScoreColor = (
    resume
  ) => {
    const score =
      Number(
        resume?.ai_score
      );


    if (
      !Number.isFinite(score)
    ) {
      return "#8b91a5";
    }


    if (score >= 80) {
      return "#198754";
    }


    if (score >= 60) {
      return "#6652e8";
    }


    return "#d97706";
  };


  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f7f8fc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >

        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "45px",
            textAlign: "center",
            boxShadow:
              "0 10px 30px rgba(40,40,80,0.06)",
          }}
        >

          <div
            style={{
              width: "55px",
              height: "55px",
              borderRadius: "15px",
              background: "#eeeaff",
              color: "#6652e8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin:
                "0 auto 18px",
              fontSize: "24px",
            }}
          >
            ✦
          </div>


          <h2
            style={{
              margin: 0,
              color: "#17203a",
            }}
          >
            Loading Resumes...
          </h2>


          <p
            style={{
              color: "#68708a",
              marginTop: "10px",
            }}
          >
            Fetching your resumes
            and AI scores.
          </p>

        </div>

      </div>
    );
  }


  /* ==========================================================
     MAIN PAGE
  ========================================================== */

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: "40px 30px",
      }}
    >

      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          <div>

            <p
              style={{
                color: "#6652e8",
                fontWeight: "800",
                fontSize: "13px",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              AI CAREER INTELLIGENCE
            </p>


            <h1
              style={{
                margin: 0,
                color: "#17203a",
                fontSize: "38px",
                fontWeight: "800",
              }}
            >
              My Resumes
            </h1>


            <p
              style={{
                color: "#68708a",
                marginTop: "10px",
                fontSize: "16px",
              }}
            >
              Manage your resumes and
              keep your career information
              ready for applications.
            </p>

          </div>


          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              navigate(
                "/candidate/dashboard"
              )
            }
          >
            ← Dashboard
          </button>

        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            style={{
              background: "#fff0f0",
              border:
                "1px solid #ffd2d2",
              color: "#c62828",
              padding:
                "15px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}


        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {success && (
          <div
            style={{
              background: "#effaf3",
              border:
                "1px solid #ccebd8",
              color: "#247a46",
              padding:
                "15px 18px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}


        {/* ====================================================
            UPLOAD CARD
        ==================================================== */}

        <section
          style={{
            background: "#fff",
            borderRadius: "22px",
            padding: "32px",
            marginBottom: "32px",
            border:
              "1px dashed #cfc8ff",
            boxShadow:
              "0 8px 25px rgba(40,40,80,0.04)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "22px",
              flexWrap: "wrap",
            }}
          >

            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "18px",
                background: "#eeeaff",
                color: "#6652e8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                flexShrink: 0,
              }}
            >
              ↑
            </div>


            <div
              style={{
                flex: 1,
                minWidth: "260px",
              }}
            >

              <h2
                style={{
                  margin: 0,
                  color: "#17203a",
                  fontSize: "21px",
                }}
              >
                Upload a new resume
              </h2>


              <p
                style={{
                  color: "#68708a",
                  marginTop: "8px",
                  lineHeight: "1.6",
                }}
              >
                Upload your latest resume
                in PDF format. HireIntel AI
                will analyze your resume
                and generate job matches.
              </p>


              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "15px",
                  flexWrap:
                    "wrap",
                  marginTop: "18px",
                }}
              >

                <label
                  htmlFor="resume-upload"
                  className="btn btn-outline"
                  style={{
                    cursor:
                      uploading
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      uploading
                        ? 0.6
                        : 1,
                  }}
                >
                  {uploading
                    ? "Analyzing Resume..."
                    : "Choose PDF Resume"}
                </label>


                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={
                    handleUpload
                  }
                  disabled={
                    uploading
                  }
                  style={{
                    display:
                      "none",
                  }}
                />


                <span
                  style={{
                    color:
                      "#8b91a5",
                    fontSize:
                      "13px",
                  }}
                >
                  Maximum file size:
                  {" "}10 MB
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            RESUME HEADER
        ==================================================== */}

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "18px",
          }}
        >

          <div>

            <h2
              style={{
                margin: 0,
                color: "#17203a",
                fontSize: "27px",
              }}
            >
              Uploaded Resumes
            </h2>


            <p
              style={{
                color: "#8b91a5",
                marginTop: "7px",
              }}
            >
              {resumes.length}{" "}
              {resumes.length === 1
                ? "resume"
                : "resumes"}{" "}
              found.
            </p>

          </div>

        </div>


        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {resumes.length === 0 ? (

          <section
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding:
                "60px 30px",
              textAlign:
                "center",
            }}
          >

            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "20px",
                background:
                  "#eeeaff",
                color:
                  "#6652e8",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                margin:
                  "0 auto 20px",
                fontSize:
                  "30px",
              }}
            >
              📄
            </div>


            <h2
              style={{
                margin: 0,
                color:
                  "#17203a",
              }}
            >
              No resumes uploaded
            </h2>


            <p
              style={{
                color:
                  "#68708a",
                marginTop:
                  "10px",
              }}
            >
              Upload your resume to
              enable AI resume analysis
              and job matching.
            </p>

          </section>

        ) : (

          /* ==================================================
             RESUME LIST
          ================================================== */

          <div
            style={{
              display:
                "grid",
              gap: "18px",
            }}
          >

            {resumes.map(
              (
                resume,
                index
              ) => (

                <section
                  key={
                    resume.id
                  }
                  style={{
                    background:
                      "#fff",

                    borderRadius:
                      "20px",

                    padding:
                      "25px 28px",

                    boxShadow:
                      "0 6px 20px rgba(40,40,80,0.04)",

                    border:
                      index === 0
                        ? "1px solid #ded8ff"
                        : "1px solid #edf0f5",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "space-between",

                      gap:
                        "20px",

                      flexWrap:
                        "wrap",
                    }}
                  >

                    {/* ========================================
                       RESUME INFORMATION
                    ======================================== */}

                    <div
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap:
                          "18px",

                        minWidth:
                          0,

                        flex:
                          1,
                      }}
                    >

                      <div
                        style={{
                          width:
                            "58px",

                          height:
                            "58px",

                          borderRadius:
                            "16px",

                          background:
                            "#fff0f0",

                          color:
                            "#d63c3c",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          fontWeight:
                            "800",

                          fontSize:
                            "13px",

                          flexShrink:
                            0,
                        }}
                      >
                        PDF
                      </div>


                      <div
                        style={{
                          minWidth:
                            0,
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "10px",

                            flexWrap:
                              "wrap",
                          }}
                        >

                          <h3
                            style={{
                              margin:
                                0,

                              color:
                                "#17203a",

                              fontSize:
                                "20px",
                            }}
                          >
                            Resume #
                            {
                              resume.id
                            }
                          </h3>


                          {index ===
                            0 && (
                            <span
                              style={{
                                background:
                                  "#eeeaff",

                                color:
                                  "#6652e8",

                                padding:
                                  "5px 10px",

                                borderRadius:
                                  "20px",

                                fontSize:
                                  "11px",

                                fontWeight:
                                  "800",
                              }}
                            >
                              LATEST
                            </span>
                          )}

                        </div>


                        <div
                          style={{
                            display:
                              "flex",

                            gap:
                              "15px",

                            flexWrap:
                              "wrap",

                            marginTop:
                              "7px",

                            color:
                              "#8b91a5",

                            fontSize:
                              "13px",
                          }}
                        >

                          <span>
                            Resume ID:
                            {" "}
                            {
                              resume.id
                            }
                          </span>


                          <span>
                            Uploaded:
                            {" "}
                            {
                              formatDate(
                                resume.uploaded_at
                              )
                            }
                          </span>

                        </div>


                        <p
                          style={{
                            margin:
                              "8px 0 0",

                            color:
                              "#68708a",

                            fontSize:
                              "13px",

                            maxWidth:
                              "600px",

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {
                            resume.original_filename ||
                            "Uploaded Resume"
                          }
                        </p>

                      </div>

                    </div>


                    {/* ========================================
                       AI SCORE
                    ======================================== */}

                    <div
                      style={{
                        minWidth:
                          "110px",

                        textAlign:
                          "center",
                      }}
                    >

                      <span
                        style={{
                          display:
                            "block",

                          color:
                            "#8b91a5",

                          fontSize:
                            "12px",

                          marginBottom:
                            "5px",
                        }}
                      >
                        AI Score
                      </span>


                      <strong
                        style={{
                          display:
                            "block",

                          fontSize:
                            "23px",

                          fontWeight:
                            "800",

                          color:
                            getScoreColor(
                              resume
                            ),
                        }}
                      >
                        {
                          renderScore(
                            resume
                          )
                        }
                      </strong>

                    </div>


                    {/* ========================================
                       STATUS
                    ======================================== */}

                    <div
                      style={{
                        minWidth:
                          "95px",

                        textAlign:
                          "center",
                      }}
                    >

                      <span
                        style={{
                          display:
                            "inline-block",

                          background:
                            "#effaf3",

                          color:
                            "#247a46",

                          padding:
                            "9px 14px",

                          borderRadius:
                            "20px",

                          fontSize:
                            "12px",

                          fontWeight:
                            "700",
                        }}
                      >
                        Analyzed
                      </span>

                    </div>


                    {/* ========================================
                       DELETE
                    ======================================== */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          resume.id
                        )
                      }
                      disabled={
                        deletingId ===
                        resume.id
                      }
                      style={{
                        border:
                          "1px solid #f0d2d2",

                        background:
                          "#fff",

                        color:
                          "#d93025",

                        borderRadius:
                          "10px",

                        padding:
                          "10px 14px",

                        cursor:
                          deletingId ===
                          resume.id
                            ? "not-allowed"
                            : "pointer",

                        opacity:
                          deletingId ===
                          resume.id
                            ? 0.6
                            : 1,
                      }}
                    >
                      {
                        deletingId ===
                        resume.id
                          ? "Deleting..."
                          : "Delete"
                      }
                    </button>

                  </div>

                </section>

              )
            )}

          </div>
        )}


        {/* ====================================================
            RESUME INTELLIGENCE
        ==================================================== */}

        <section
          style={{
            marginTop:
              "30px",

            background:
              "linear-gradient(135deg, #f7f4ff, #ffffff)",

            border:
              "1px solid #ded8ff",

            borderRadius:
              "20px",

            padding:
              "28px",
          }}
        >

          <div
            style={{
              display:
                "flex",

              gap:
                "15px",

              alignItems:
                "flex-start",
            }}
          >

            <div
              style={{
                width:
                  "45px",

                height:
                  "45px",

                borderRadius:
                  "14px",

                background:
                  "#eeeaff",

                color:
                  "#6652e8",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                fontSize:
                  "20px",

                flexShrink:
                  0,
              }}
            >
              ✦
            </div>


            <div>

              <h3
                style={{
                  margin:
                    0,

                  color:
                    "#17203a",
                }}
              >
                Resume Intelligence
              </h3>


              <p
                style={{
                  color:
                    "#68708a",

                  lineHeight:
                    "1.7",

                  marginTop:
                    "8px",
                }}
              >
                HireIntel AI analyzes your
                resume to identify skills,
                education, experience,
                projects, certifications
                and keywords. The analysis
                is also used for intelligent
                job matching.
              </p>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


export default CandidateResumes;