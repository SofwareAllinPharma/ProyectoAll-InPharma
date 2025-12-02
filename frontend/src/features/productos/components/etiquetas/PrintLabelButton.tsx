import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ProductLabelPdf } from "./ProductLabelPdf";
import { generateWordLabel } from "./ProductLabelWord";
import type { Producto } from "../../types/producto.types";
import Button from "../../../../components/ui/Button";
import { Printer, ChevronDown } from "lucide-react";

interface PrintLabelButtonProps {
  producto: Producto;
}

export const PrintLabelButton = ({ producto }: PrintLabelButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGenerateWord = async () => {
    setIsGeneratingWord(true);
    try {
      await generateWordLabel(producto);
      setShowMenu(false);
    } catch (error) {
      console.error("Error generando Word:", error);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(<ProductLabelPdf producto={producto} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `etiqueta-${producto.nombreComercial
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        icon={<Printer size={16} />}
        onClick={() => setShowMenu(!showMenu)}
      >
        Imprimir Etiqueta
        <ChevronDown size={16} className="ml-1" />
      </Button>

      {showMenu && (
        <>
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? "Generando PDF..." : "Descargar PDF"}
              </button>

              <button
                onClick={handleGenerateWord}
                disabled={isGeneratingWord}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingWord ? "Generando Word..." : "Descargar Word"}
              </button>
            </div>
          </div>

          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
        </>
      )}
    </div>
  );
};
