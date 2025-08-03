import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Image,
  File,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { PatientUser, MedicalRecord } from "../App";
import { useAuth } from "../contexts/AuthContext";

interface UploadRecordsProps {
  user: PatientUser;
  onBack: () => void;
}

const CLOUD_NAME = "dxhoy2m9o";
const UPLOAD_PRESET = "unsigned_preset";

const UploadRecords: React.FC<UploadRecordsProps> = ({ user, onBack }) => {
  const { updateUserProfile } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recordData, setRecordData] = useState({
    title: "",
    category: "other" as MedicalRecord["category"],
    notes: "",
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const isPdf = file.type === "application/pdf";

    const endpoint = isPdf
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    const end2 = await fetch(
      `https://gd2r2h51-8000.inc1.devtunnels.ms/upload/${user.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file }),
      }
    );

    if (!res.ok && !end2.ok) {
      const errorDetails = await res.json();
      console.error("Upload failed:", errorDetails);
      throw new Error(errorDetails.error.message || "Cloudinary upload failed");
    }

    const json = await res.json();
    return json.secure_url;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 10 * 1024 * 1024;
      return isValidType && isValidSize;
    });
    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFiles.length === 0 && !recordData.notes) {
      setError("Please upload files or add notes");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of uploadedFiles) {
        const url = await uploadToCloudinary(file);
        if (url) uploadedUrls.push(url);
      }

      const fileType =
        uploadedFiles.length > 0
          ? uploadedFiles[0].type.startsWith("image/")
            ? "image"
            : "pdf"
          : "text";

      const medicalRecord: MedicalRecord & { url?: string } = {
        id: Date.now().toString(),
        type: fileType,
        title: recordData.title,
        content: recordData.notes || "No additional notes",
        uploadDate: new Date().toISOString().split("T")[0],
        category: recordData.category,
        url: uploadedUrls[0] || "", // First file's URL
      };

      const updatedRecords = [...user.medicalRecords, medicalRecord];
      await updateUserProfile({ medicalRecords: updatedRecords });

      setRecordData({ title: "", category: "other", notes: "" });
      setUploadedFiles([]);
      setSuccess("Medical record uploaded successfully!");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <Image className="h-5 w-5 text-green-600" />;
    if (file.type === "application/pdf")
      return <File className="h-5 w-5 text-red-600" />;
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-xl font-bold text-gray-900">
                Upload Medical Records
              </h1>
              <p className="text-sm text-gray-600">
                Add images, PDFs, and notes to your medical profile
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Record Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Record Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Record Title
                </label>
                <input
                  type="text"
                  required
                  value={recordData.title}
                  onChange={(e) =>
                    setRecordData({ ...recordData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Blood Test Results"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={recordData.category}
                  onChange={(e) =>
                    setRecordData({
                      ...recordData,
                      category: e.target.value as MedicalRecord["category"],
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="other">Other</option>
                  <option value="allergy">Allergy Information</option>
                  <option value="medication">Medication</option>
                  <option value="condition">Medical Condition</option>
                  <option value="vaccine">Vaccination</option>
                  <option value="test">Test Results</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={recordData.notes}
                onChange={(e) =>
                  setRecordData({ ...recordData, notes: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Upload Files
            </h2>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Supports JPG, PNG, and PDF files up to 10MB
              </p>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>Choose Files</span>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Uploaded Files
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Uploading..." : "Upload Records"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadRecords;
