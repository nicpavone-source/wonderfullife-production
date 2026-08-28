export default function ProductInformation() {
  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontSize: "12px",
    fontWeight: 800,
    color: "#173d29",
  } as const;

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #dfe6dd",
    borderRadius: "8px",
    fontSize: "13px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#ffffff",
    marginBottom: "14px",
  } as const;

  return (
    <>
      <label style={labelStyle}>
        Brand
        <input
          name="brand"
          placeholder="Example: USANA"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        SKU
        <input
          name="sku"
          placeholder="WL-PROD-001"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        UPC
        <input
          name="upc"
          placeholder="Barcode number"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Serving Size
        <input
          name="servingSize"
          placeholder="2 Softgels"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Package Size
        <input
          name="packageSize"
          placeholder="112 Softgels"
          style={inputStyle}
        />
      </label>

      <label style={labelStyle}>
        Country of Origin
        <input
          name="country"
          placeholder="United States"
          style={inputStyle}
        />
      </label>
    </>
  );
}