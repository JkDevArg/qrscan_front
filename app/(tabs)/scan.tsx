import {
  Button,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { checkURL } from "@/services/api";
import { useState } from "react";
import * as Linking from "expo-linking";

let debounceTimeout: NodeJS.Timeout;

const ScanScreen: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [urlToOpen, setUrlToOpen] = useState("");

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Necesitamos tu permiso para usar la cámara
        </Text>
        <Button onPress={requestPermission} title="Otorgar permiso" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      setScanned(true);

      try {
        const response = await checkURL(data);
        console.log(response)

        if (!response) {
          setUrlToOpen(data);
          setModalMessage("Esta URL parece segura. ¿Deseas abrirla?");
          setModalVisible(true);
        } else {
          setModalMessage("¡Cuidado! Esta URL ha sido marcada como maliciosa.");
          setModalVisible(true);
        }
      } catch (error) {
        //console.error("Error al verificar la URL:", error);
        setModalMessage("No se pudo verificar la URL. Inténtalo nuevamente.");
        setModalVisible(true);
      }
    }, 100);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleYes = () => {
    Linking.openURL(urlToOpen);
    setModalVisible(false);
    setScanned(false);
  };

  const handleNo = () => {
    setModalVisible(false);
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      {/* Cámara */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        type={facing}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.frameContainer}>
          <Text style={styles.scanText}>ScanQR</Text>
          <View style={styles.frame} />
        </View>
      </View>

      <View style={styles.githubButtonContainer}>
        <TouchableOpacity style={styles.githubButton} onPress={() => Linking.openURL("https://github.com/JkDevArg")}>
          <Text style={styles.githubText}>GitHub</Text>
        </TouchableOpacity>
      </View>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              <Button title="No" onPress={handleNo} />
              <Button title="Sí" onPress={handleYes} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frameContainer: {
    width: 260,
    height: 260,
    borderRadius: 15,
    backgroundColor: "rgba(73, 73, 73, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 250,
    height: 250,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  scanText: {
    position: "absolute",
    top: -25,
    left: -5,
    fontSize: 16,
    fontWeight: "normal",
    color: "#FFFFFF",
    //backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },

  message: {
    textAlign: "center",
    paddingBottom: 20,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalMessage: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  githubButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    alignItems: "center",
  },
  githubButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  githubText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScanScreen;
