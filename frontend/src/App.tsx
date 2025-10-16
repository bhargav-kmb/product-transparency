import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';

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
  const [productId, setProductId] = useState<number | null>(null);

  const { control, handleSubmit } = useForm<Step1Form>();

  // Step 1 → Generate questions
  const onStep1Submit = async (data: Step1Form) => {
    setProductData(data);
    try {
      const res = await axios.post('http://localhost:5001/api/suggest-questions', data);
      const qs: Question[] = res.data.questions.map((q: string) => ({ question: q, answer: '' }));
      setQuestions(qs);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Failed to get questions from AI service');
    }
  };

  // Step 2 → Save product
  const onStep2Submit = async () => {
    if (!productData) return;
    try {
      const payload = { ...productData, questions };
      const res = await axios.post('http://localhost:4000/api/products', payload);

      // ✅ Check both possible response formats
      const newId = res.data.id || res.data._id;
      if (!newId) throw new Error('Product ID missing in backend response');

      alert(`✅ Product saved successfully! ID: ${newId}`);
      setProductId(newId);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    }
  };

  // Step 3 → Preview PDF
  const previewPDF = async () => {
    if (!productId) return alert('Product ID missing!');
    try {
      const pdfUrl = `http://localhost:4000/api/products/${productId}/report`;
      const res = await axios.get(pdfUrl, { responseType: 'blob' });

      // ✅ Create blob and open
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error(err);
      alert('Failed to generate or fetch PDF');
    }
  };

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem', marginBottom: '1rem', borderRadius: '5px', border: '1px solid #ccc' };
  const labelStyle = { fontWeight: 600, display: 'block' };
  const buttonStyle = { padding: '0.5rem 1rem', marginTop: '1rem', borderRadius: '5px', border: 'none', backgroundColor: '#4CAF50', color: 'white', cursor: 'pointer' };
  const secondaryButton = { ...buttonStyle, backgroundColor: '#007BFF', marginLeft: '1rem' };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      {step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)}>
          <h2>Step 1: Product Info</h2>
          <label style={labelStyle}>Product Name</label>
          <Controller name="name" control={control} defaultValue="" render={({ field }) => <input {...field} style={inputStyle} required />} />
          <label style={labelStyle}>Category</label>
          <Controller name="category" control={control} defaultValue="" render={({ field }) => <input {...field} style={inputStyle} required />} />
          <button type="submit" style={buttonStyle}>Next</button>
        </form>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Follow-up Questions</h2>
          {questions.map((q, i) => (
            <div key={i}>
              <label style={labelStyle}>{q.question}</label>
              <input
                type="text"
                value={q.answer}
                style={inputStyle}
                onChange={(e) => {
                  const updated = [...questions];
                  updated[i].answer = e.target.value;
                  setQuestions(updated);
                }}
              />
            </div>
          ))}
          <button onClick={onStep2Submit} style={buttonStyle}>Submit Product</button>
          <button onClick={() => setStep(1)} style={secondaryButton}>Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Step 3: Preview Report</h2>
          <button onClick={previewPDF} style={buttonStyle}>Preview / Download PDF</button>
          <button
            onClick={() => {
              setStep(1);
              setProductData(null);
              setQuestions([]);
              setProductId(null);
            }}
            style={secondaryButton}
          >
            Submit Another Product
          </button>
        </div>
      )}
    </div>
  );
}
