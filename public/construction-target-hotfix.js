(function installConstructionTargetHotfix() {
  if (window.__constructionTargetHotfixInstalled) return;

  if (
    typeof resolveConstructionTarget !== "function" ||
    typeof renderConstruction !== "function" ||
    typeof buildResolvedTarget !== "function" ||
    typeof mapViewForKey !== "function"
  ) {
    window.setTimeout(installConstructionTargetHotfix, 40);
    return;
  }

  window.__constructionTargetHotfixInstalled = true;

  function mapDefinedConstructionTargetHotfix() {
    const view = mapViewForKey("construction");
    const [lat, lng] = view.center;
    const target = {
      status: "resolved",
      scenario: "construction",
      label: "Map-defined construction AOI",
      query: "map-defined AOI",
      source: "map",
      location: { lat, lng },
      need: inferCustomObservationNeed(missionPrompt.value)
    };
    target.ref = targetRefFromTarget(target);
    return target;
  }

  const originalRenderConstruction = renderConstruction;
  renderConstruction = function patchedRenderConstruction(resolved) {
    if (resolved) resetMapViewOverride("construction");
    return originalRenderConstruction.apply(this, arguments);
  };

  resolveConstructionTarget = function patchedResolveConstructionTarget(mode, geocodeResult = null) {
    constructionResolved = true;
    activeResolvedTarget =
      buildResolvedTarget(addressInput.value || missionPrompt.value, geocodeResult, null, "construction") ||
      mapDefinedConstructionTargetHotfix();
    resetMapViewOverride("construction");

    const geocodeNote =
      geocodeResult?.source === "google" && geocodeResult.result?.location
        ? ` Google Maps resolved it to ${geocodeResult.result.formatted_address} (${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}).`
        : "";
    const geocodeNoteZh =
      geocodeResult?.source === "google" && geocodeResult.result?.location
        ? ` Google Maps 已解析為 ${geocodeResult.result.formatted_address}（${geocodeResult.result.location.lat.toFixed(4)}, ${geocodeResult.result.location.lng.toFixed(4)}）。`
        : "";

    renderConstruction(true);
    clarificationBox.className = "clarification-box ready";
    clarificationBox.innerHTML =
      mode === "address"
        ? `<strong>Target resolved / 目標已解析。</strong><p>The provided address has been converted into a geolocated construction AOI.${geocodeNote} The recurring imaging planner can continue. / 地址已轉為可定位的工地 AOI。${geocodeNoteZh}系統可以繼續建立週期性拍攝計畫。</p>`
        : "<strong>AOI accepted / AOI 已接受。</strong><p>The map-defined construction boundary has been converted into a target geometry. The recurring imaging planner can continue. / 地圖框選的工地邊界已轉為目標幾何，系統可以繼續規劃。</p>";
    aoiHint.classList.add("hidden");
    approveButton.disabled = !activeCommandPacket;
    updatePresentationStep();
  };
})();
