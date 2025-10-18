import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

type Step1Form = {
  name: string;
  category: string;
};

type Question = {
  question: string;
  answer: string;
};

export default function App() {
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [productData, setProductData] = useState<Step1Form | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm<Step1Form>();

  // ✅ Single backend for everything
  const BACKEND_BASE = "http://localhost:4000";

  // Step 1: Fetch AI-generated questions
  const onStep1Submit = async (data: Step1Form) => {
    setProductData(data);
    setLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_BASE}/api/suggest-questions`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      const qs: Question[] = res.data.questions.map((q: string) => ({
        question: q,
        answer: "",
      }));

      setQuestions(qs);
      setStep(2);
    } catch (err) {
      console.error("Failed to fetch AI questions:", err);
      alert("Failed to fetch AI questions. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save product + answers
  const onStep2Submit = async () => {
    if (!productData) return;
    setLoading(true);

    try {
      const payload = { ...productData, questions };
      const res = await axios.post(
        `${BACKEND_BASE}/api/products`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setProductId(res.data.id);
      setStep(3);
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Failed to save product. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  // Handle answers input
  const handleAnswerChange = (i: number, v: string) => {
    const newQs = [...questions];
    newQs[i].answer = v;
    setQuestions(newQs);
  };

  // Step 3: View/download PDF
  const previewPDF = () => {
    if (!productId) return;
    window.open(`${BACKEND_BASE}/api/products/${productId}/report`, "_blank");
  };

  const restart = () => {
    reset();
    setStep(1);
    setProductData(null);
    setProductId(null);
    setQuestions([]);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="d-flex justify-content-center w-100">
        <div
          className="card shadow-lg border-0 rounded-4 p-4"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <h2 className="text-center fw-bold mb-4 text-primary">
            🧾 Product Transparency Portal
          </h2>

          <div className="progress mb-4" style={{ height: "8px" }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {loading && (
            <div className="text-center mb-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Product Name</label>
                <Controller
                  name="name"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      className="form-control"
                      placeholder="e.g., Organic Shampoo"
                      required
                    />
                  )}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Category</label>
                <Controller
                  name="category"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <input
                      {...field}
                      className="form-control"
                      placeholder="e.g., Cosmetic, Food, Electronic"
                      required
                    />
                  )}
                />
              </div>

              <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-primary px-4" type="submit">
                  Next
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <>
              <h5 className="fw-bold text-secondary mb-3 text-center">
                Step 2: Answer AI-generated Questions
              </h5>

              {questions.map((q, i) => (
                <div className="mb-3 p-3 border rounded-3 bg-light" key={i}>
                  <label className="form-label fw-semibold">{q.question}</label>
                  <input
                    className="form-control"
                    value={q.answer}
                    onChange={(e) => handleAnswerChange(i, e.target.value)}
                    placeholder="Enter your answer here"
                  />
                </div>
              ))}

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary" onClick={() => setStep(1)}>
                  Back
                </button>
                <button className="btn btn-success" onClick={onStep2Submit}>
                  Submit
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <h5 className="fw-bold text-success mb-3">
                Product Saved Successfully!
              </h5>
              <button className="btn btn-primary me-2" onClick={previewPDF}>
                View / Download PDF
              </button>
              <button className="btn btn-outline-secondary" onClick={restart}>
                Add Another Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
