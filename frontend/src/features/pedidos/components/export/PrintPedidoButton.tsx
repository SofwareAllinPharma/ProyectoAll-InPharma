import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { PedidoDetailPdf } from "./PedidoDetailPdf";
import { generatePedidoWord } from "./PedidoDetailWord";
import type { Pedido } from "../../types/pedido.types";
import type { InsumoRequerido } from "../../utils/insumos.utils";
import Button from "../../../../components/ui/Button";
import { Printer, ChevronDown } from "lucide-react";

interface PrintPedidoButtonProps {
  pedido: Pedido;
  insumos: InsumoRequerido[];
}

export const PrintPedidoButton = ({ pedido, insumos }: PrintPedidoButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const handlePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const blob = await pdf(
        <PedidoDetailPdf pedido={pedido} insumos={insumos} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pedido-PED-${pedido.numPedido}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setShowMenu(false);
    } catch (e) {
      console.error("Error generando PDF:", e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleWord = async () => {
    setIsGeneratingWord(true);
    try {
      await generatePedidoWord(pedido, insumos);
      setShowMenu(false);
    } catch (e) {
      console.error("Error generando Word:", e);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Button
        variant="outline"
        icon={<Printer size={16} />}
        onClick={() => setShowMenu(!showMenu)}
      >
        Exportar
        <ChevronDown size={16} className="ml-1" />
      </Button>

      {showMenu && (
        <>
          <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              <button
                onClick={handlePDF}
                disabled={isGeneratingPDF}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? "Generando PDF..." : "Descargar PDF"}
              </button>
              <button
                onClick={handleWord}
                disabled={isGeneratingWord}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingWord ? "Generando Word..." : "Descargar Word"}
              </button>
            </div>
          </div>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
        </>
      )}
    </div>
  );
};
