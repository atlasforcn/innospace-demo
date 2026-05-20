# Satellite Mission Payload, GSD, Communications, and ADCS Reference / 衛星任務酬載、GSD、通訊與姿態限制參考

Last updated: 2026-05-20

## Purpose / 用途

這份文件給衛星任務規劃系統或 LLM 意圖解析層使用，用來把自然語言任務轉成可檢查的工程需求：

1. 任務類型需要什麼衛星酬載。
2. 不同軌道高度與任務需要什麼 GSD / 空間解析度。
3. 衛星通訊有哪些限制。
4. 衛星姿態控制 ADCS / AOCS 有哪些限制。

重要提醒：使用者寫的「籌載」在航太語境通常應為「酬載 payload」。本文統一使用「酬載」。

## Executive Rules / 系統快速判斷規則

當系統收到任務需求時，先判斷任務真正要回答的問題，而不是先選衛星。

| 任務意圖 | 優先酬載 | 常見軌道 | 建議 GSD / 解析度 | 硬限制 |
| --- | --- | --- | --- | --- |
| 詳細目標檢視、建物、車輛、工地、災損細節 | 高解析光學 panchromatic / RGB / NIR | VLEO / LEO / SSO | 0.3-1 m；一般工地監測可 1-3 m | 白天、少雲、離軸角、姿態穩定、法規與商業可用解析度 |
| 農業、植被、水體、土地覆蓋、燒灼區 | 多光譜 VIS / NIR / SWIR | LEO / SSO | 3-30 m；區域尺度常用 10-30 m | 需要光譜波段、太陽高度、校正、雲遮 |
| 材質辨識、礦物、污染、精細光譜特徵 | 高光譜 hyperspectral | LEO / SSO | 約 5-30 m 或更粗，取決於 SNR 與波段數 | 資料量大、SNR、大氣校正、白天與雲遮 |
| 雲下、夜間、洪水、地表變形、海事偵測 | SAR，依任務選 X / C / L band | LEO / SSO | 1-30 m；InSAR 常用 3-20 m | 入射角、偏振、重訪幾何、斑點雜訊、資料處理延遲 |
| 火災熱點、火線、火後評估 | 熱紅外 MWIR / LWIR，加上光學或 SWIR | LEO / GEO | LEO 熱點常需數十到數百米；GEO 可接受 0.5-2 km 但高時間頻率 | 熱靈敏度、飽和、煙霧、雲、資料延遲 |
| 即時天氣、雲系、颱風、對流監測 | GEO 多光譜氣象成像儀、閃電偵測器、聲探儀 | GEO | 約 0.5-2 km 在星下點；越靠邊緣越差 | GEO 距離遠，細節解析度低，但時間頻率高 |
| 大氣剖面、氣候、雲氣膠垂直結構 | 微波/紅外聲探儀、GNSS-RO、雷達、光達 | LEO / SSO / MEO occultation | 不以一般 GSD 為主；看 footprint、垂直解析度、剖面密度 | 軌道覆蓋、校正、同化延遲 |
| 海洋高度、冰層高度、地形高度 | 雷達高度計、雷射高度計、寬幅高度計 | LEO / SSO | 看足跡 footprint、沿軌距離與垂直精度；不是一般影像 GSD | 嚴格軌道定軌、姿態、時間同步 |
| 船舶識別與海域態勢 | SAR + AIS 接收器 + 光學補強 | LEO / SSO | SAR 1-20 m 偵測；光學 0.3-3 m 識別；AIS 無 GSD | AIS 訊號碰撞、船隻關閉 AIS、雲、海況 |
| 通訊覆蓋、IoT、寬頻、中繼 | RF transponder / regenerative payload / phased array / optical terminal | LEO / MEO / GEO | 不適用 GSD；看資料率、延遲、EIRP、G/T、波束覆蓋 | 頻譜授權、鏈路預算、指向、雨衰、干擾 |
| 導航定位授時 PNT | 原子鐘、L-band 導航訊號產生器、導航天線 | MEO 為主，也可 GEO / IGSO 區域增強 | 不適用 GSD；看 ranging accuracy、clock stability、幾何分佈 | 時間同步、星座幾何、訊號完整性、地面控制 |

## Core Concepts / 核心概念

### GSD is not the same as true resolution / GSD 不等於真實解析力

GSD 是影像相鄰像素中心在地面的距離。NASA Earth Observatory 說明，較小像素面積代表感測器能辨識較小物件；ESA 也把 GSD 定義為地面相鄰像素中心的距離。

但任務規劃時不能只看 GSD。真實可解譯程度還受這些因素影響：

- 光學 MTF、點擴散函數、線擴散函數、FWHM。
- 曝光時間、平台速度、影像拖影、姿態 jitter。
- 大氣、雲、煙、霾、太陽高度、陰影。
- 感測器 SNR、位元深度、壓縮、輻射校正。
- 離軸角造成的投影變形、遮蔽、地物側面可見性。

規劃公式可用：

```text
GSD ~= altitude_above_ground * detector_pixel_pitch / focal_length
```

因此在相同相機下，軌道高度增加，GSD 會近似等比例變差。若要在更高軌道維持相同 GSD，需要更長焦距、更大口徑、更大衛星、更高姿態穩定度與更多資料下傳能力。

### Object size rule of thumb / 目標尺寸粗估規則

若目標實體尺寸為 `S`：

- 偵測 detection：通常希望目標至少跨 2-4 個像素，粗估 `GSD <= S / 3`。
- 分類 classification：通常希望 5-10 個像素，粗估 `GSD <= S / 8`。
- 識別 identification：通常希望 10-20+ 個像素，粗估 `GSD <= S / 15`。

這只是早期規劃用的保守規則。正式設計應用 NIIRS、GRD、MTF、SNR、目標對比、背景複雜度與模型性能驗證。Civil NIIRS 是一種以任務可解譯程度描述影像價值的尺度，可用於規格溝通與任務排序。

## Mission Payload Matrix / 任務與酬載對照

### 1. 高解析光學 Earth Observation

| 任務 | 酬載 | 建議 GSD | 為什麼適合 | 系統要檢查 |
| --- | --- | --- | --- | --- |
| 工地進度、道路、橋梁、港口、災損 | Panchromatic + RGB / NIR，多半可 pan-sharpen | 0.3-3 m | 紋理與邊界直觀，利於人工判讀與 CV 偵測 | 雲量、白天、太陽高度、陰影、off-nadir、姿態穩定、重訪 |
| 車輛、飛機、船舶細節 | VHR optical | 0.3-1 m | 對小目標識別最直接 | 目標尺寸、合法可取得解析度、雲、影像拖影 |
| 地圖更新、建物輪廓 | Optical stereo / tri-stereo | 0.3-2 m | 可建立 DSM / 3D | 立體幾何、重疊率、離軸角、基高比 |

限制：

- 被動光學通常需要日照，且雲、煙、霾會降低可用性。
- 高解析通常代表窄 swath、較高資料量、較高姿態穩定需求。
- 離軸拍攝可縮短重訪，但會降低影像品質與幾何一致性。

### 2. 多光譜 / 高光譜

| 任務 | 酬載 | 建議 GSD | 為什麼適合 | 系統要檢查 |
| --- | --- | --- | --- | --- |
| 作物健康、NDVI、植被分類 | Multispectral VIS / Red Edge / NIR / SWIR | 3-30 m | 光譜指標比單純細節更重要 | 波段、校正、同季同時段、雲遮 |
| 洪水、水體、濕地、燒灼區 | Multispectral NIR / SWIR | 10-30 m | 水、植被、燒灼痕跡在 NIR/SWIR 可分辨 | 雲、太陽角、反射率校正 |
| 礦物、污染、材質辨識 | Hyperspectral | 5-30 m 或任務指定 | 窄波段可辨識吸收特徵 | SNR、光譜解析度、資料量、大氣校正 |

參考任務：

- Sentinel-2 MSI 提供 13 個光譜波段，空間解析度包含 10 m、20 m、60 m，swath 約 290 km。
- Landsat 9 提供 15 m panchromatic、30 m VSWIR/SWIR、100 m thermal，以及 185 km swath。

### 3. SAR / InSAR / Radar

| 任務 | 酬載 | 建議解析度 | 為什麼適合 | 系統要檢查 |
| --- | --- | --- | --- | --- |
| 雲下洪水、夜間災害 | C / X band SAR | 5-30 m | 主動雷達，可夜間與多雲條件工作 | 入射角、偏振、speckle、地形遮蔽 |
| 建物或港口變化 | X / C band SAR 高解析模式 | 1-10 m | 幾何與散射變化明顯 | 模式、swath、處理延遲 |
| 地表變形、地震、火山、沉陷 | L / C / X band repeat-pass InSAR | 3-20 m | 相位可量測微小形變 | 精密軌道、時間基線、垂直基線、coherence |
| 森林、生物量、土壤結構 | L / P band SAR | 10-100 m | 長波長穿透植被較深 | 頻譜、天線尺寸、資料處理 |

NASA Earthdata 說明 SAR 解析度與波長/天線長度相關；不同 SAR band 的應用也不同：X-band 常用高解析城市/冰雪，C-band 是廣泛工作馬，L-band 適合較深植被穿透與 InSAR。

### 4. 熱紅外與氣象

| 任務 | 酬載 | 建議解析度 | 為什麼適合 | 系統要檢查 |
| --- | --- | --- | --- | --- |
| 火點、工業熱源、夜間熱異常 | MWIR / LWIR imager | 數十米到數百米，依熱源大小 | 可夜間觀測熱訊號 | 熱靈敏度、飽和、雲、煙、背景溫差 |
| 颱風、對流、雲、水氣 | GEO meteorological imager / sounder | 0.5-2 km 星下點等級 | GEO 持續盯同一區，時間解析度高 | 星下點距離、邊緣畸變、資料延遲 |
| 氣候、輻射收支、雲氣膠 | Radiometer / lidar / cloud radar | 多為 footprint / profile，不只看 GSD | 量測物理量而非看細節 | 校正、剖面取樣、資料同化 |

NOAA GOES-R ABI 是典型 GEO 氣象成像儀：16 個光譜 band，星下點 pixel spacing 約 0.5、1、2 km，能以高時間頻率觀測天氣系統。

### 5. 通訊、AIS、ADS-B、RF 偵測、PNT

| 任務 | 酬載 | 軌道 | 解析度概念 | 系統要檢查 |
| --- | --- | --- | --- | --- |
| 衛星通訊 / IoT / 寬頻 | RF payload、transponder、regenerative processor、phased array | LEO / MEO / GEO | 無 GSD；看 throughput、latency、coverage | 頻譜、EIRP、G/T、beam、handover、link budget |
| 資料中繼 / crosslink | RF 或 optical inter-satellite link | LEO / GEO relay | 無 GSD；看路由與延遲 | 指向、相對速度、PAT、可見時間 |
| 船舶 AIS | VHF AIS receiver | LEO | 無 GSD；看訊號接收與 geolocation | 訊號碰撞、海域密度、船隻是否開 AIS |
| 飛機 ADS-B | 1090 MHz receiver | LEO | 無 GSD；看訊號接收與 latency | 頻譜、覆蓋、訊號碰撞 |
| RF spectrum monitoring / ELINT 類 | RF receiver / antenna array | LEO | 以地理定位精度、頻譜解析度衡量 | 多星 TDOA/FDOA、頻寬、靈敏度、法規 |
| 導航定位授時 PNT | 原子鐘、導航訊號產生器、L-band antenna | MEO / GEO / IGSO | 無 GSD；看 ranging、clock、GDOP | 星座幾何、時間同步、完整性 |

ESA 的 SAT-AIS 說明指出，低軌衛星可接收遠洋與極區船舶 AIS 訊號，補足地面 AIS 覆蓋缺口。GPS 與 Galileo 類 PNT 任務則核心在原子鐘、導航訊號與星座幾何，而不是影像解析度。

## Orbit Height, Mission, and GSD / 軌道高度、任務與 GSD

| 軌道類型 | 高度範圍 | 適合任務 | 典型 GSD / 解析度 | 主要取捨 |
| --- | --- | --- | --- | --- |
| VLEO | 約 200-450 km | 超高解析光學、小型 SAR、低延遲通訊實驗 | 同一光學系統可比高 LEO 得到更細 GSD；0.3-1 m 較容易 | 大氣阻力、壽命、姿態擾動、推進/阻力補償需求高 |
| LEO | 約 450-650 km | 商業 VHR optical、SAR 星座、IoT / relay | Optical 0.3-5 m；SAR 1-10 m 依模式 | 覆蓋不連續，需星座或側擺增加重訪；通訊視窗短 |
| LEO / SSO | 約 600-850 km | Landsat、Sentinel、NISAR、極軌氣象、穩定光照 EO | 多光譜 10-30 m；熱紅外 60-100+ m；SAR 3-20 m | 光照一致，利於變化偵測；GSD 較 VLEO 差但 swath 可大 |
| 高 LEO | 約 850-2,000 km | 大範圍氣象、科學、部分通訊 | 常為數百米到公里級，或 profile / footprint | 覆蓋較廣，但精細影像成本高；輻射環境與鏈路距離增加 |
| MEO | 約 2,000-35,786 km 之間；GNSS 約 20,200 km | GPS / Galileo / PNT、部分通訊 | 影像任務通常不划算；PNT 無 GSD | 覆蓋大、星座較少；延遲與路徑損耗高於 LEO |
| GEO | 35,786 km above equator | 氣象 nowcasting、通訊、廣播、中繼 | 氣象可約 0.5-2 km 星下點；通訊無 GSD | 持續覆蓋同區域；影像細節差、延遲高、極區視角差 |
| HEO / Molniya | 高橢圓軌道 | 高緯度通訊、區域長時間觀測 | 解析度隨距離大幅變化 | 適合高緯停留；地面幾何與鏈路變化大 |

NASA Earth Observatory 將 Earth orbit 分成 high / medium / low Earth orbit，並指出 GEO 約 36,000 km 高可提供同一地區的持續天氣觀測；MEO 的半同步 GPS 軌道約在地表上方 20,200 km；LEO / polar / SSO 則常用於科學與地球觀測。

### 任務解析度需求表

| 任務結果 | 建議 GSD / 解析度 | 可用酬載 | 注意 |
| --- | --- | --- | --- |
| 知道「有沒有大範圍天氣/雲/颱風/火山灰」 | 0.5-2 km 或更粗但高時間頻率 | GEO weather imager | 時間解析度比細節更重要 |
| 區域土地覆蓋、作物區塊、洪水範圍 | 10-30 m | Multispectral、SAR | 大 swath 與一致校正重要 |
| 農田內差異、道路/河道/建物區塊 | 3-10 m | Multispectral、SAR、medium optical | 需要穩定重訪與同光照 |
| 工地進度、建物輪廓、災損判讀 | 0.5-3 m | VHR optical、high-res SAR | 雲下改用 SAR；光學需日照 |
| 車輛、飛機、船舶分類 | 0.3-1 m optical；1-10 m SAR 偵測 | VHR optical、SAR、AIS fusion | SAR 可偵測但語意識別不如光學直觀 |
| 個別小型特徵識別，例如車牌等級細節 | 商用衛星通常不應承諾 | 超高解析光學但受法規/物理限制 | 需要非常高解析、低離軸、低雲霾，且常超出商用任務 |
| 地表形變毫米到公分級 | 影像 GSD 不是主指標；看相位、coherence、baseline | InSAR | 軌道重複與處理品質比像素大小更關鍵 |
| 高度、冰層、海面高度 | footprint、along-track spacing、vertical precision | Lidar / radar altimeter | 不是一般 2D GSD 問題 |

## Satellite Communications Constraints / 衛星通訊限制

### 1. Link budget is mandatory / 必須做鏈路預算

通訊可不可行不是只看「有沒有天線」。至少要檢查：

- 頻率、頻寬、調變與編碼。
- 發射功率、天線增益、EIRP。
- 接收端 G/T、接收機雜訊、LNA、解調門檻。
- 斜距 slant range、free-space path loss、Doppler。
- 大氣、雨衰、極化損失、指向損失、線纜損失。
- 需要的 link margin。NASA SmallSat ground systems 文件提到，LEO 約 1,500 km slant range 的資料回傳常以 3 dB margin 作為可接受規劃值；深空任務可用 margin 會更吃緊。

### 2. Band selection / 頻段選擇

| 頻段 | 常見用途 | 優點 | 限制 |
| --- | --- | --- | --- |
| VHF / UHF | 低速 TT&C、學術/業餘、小型衛星早期通訊 | 硬體便宜、波束寬、姿態未穩定時較容易連上 | 資料率低、干擾與擁擠、頻譜協調限制 |
| L / S band | TT&C、低中速資料、GNSS、部分 IoT | 穩健、地面站成熟 | 頻寬有限，資料量大時不足 |
| X band | EO 資料下傳常用 | 資料率較高，雨衰比 Ka 小 | 需要較好的指向與地面站 |
| Ku / Ka band | 高資料率下傳、寬頻、relay | 頻寬大、天線可小型高增益 | 雨衰顯著、指向要求高、功耗與熱設計壓力 |
| Optical / lasercom | 高速 crosslink / downlink | 高資料率、窄波束、不佔 RF 頻譜 | PAT 極嚴格、雲會阻擋、需要光學地面站與安全規劃 |

NASA SmallSat 通訊資料指出，S/X/Ka 是 NASA 近地任務常用頻段；高頻率能支援更高資料回傳，但 rain fade、指向與系統資源會變得更困難。NASA 也指出 optical comm 可能低功耗高資料率，但雲層與精密 pointing / acquisition / tracking 是主要障礙。

### 3. Contact window and latency / 可通聯視窗與延遲

- LEO 直連地面站只有衛星過站時可見，單站通常是數分鐘級視窗；任務若急迫，需要多地面站、relay、crosslink 或 onboard prioritization。
- GEO 可長時間覆蓋同一區域，但單程距離約 35,786 km 以上。地面到 GEO 再回地面僅光速傳播就約 240 ms round trip，還不含處理與網路延遲。
- MEO 介於兩者之間，覆蓋較大但延遲與路徑損耗高於 LEO。
- 高解析 EO 的瓶頸常是資料量和下傳視窗，不是拍攝本身。NISAR 公開資料顯示其雷達資料收集、下傳與處理基準可到每天 26 Tb 等級。

### 4. Regulatory and spectrum / 法規與頻譜

- RF 發射需要授權；美國非聯邦 spacecraft transmitter 通常需 FCC license，政府用戶由 NTIA 處理，且需與 ITU 國際協調。
- NASA ground systems 文件提醒，satellite 與 ground station 都需要對指定頻率取得授權；授權可能需要數月，應在發射前完成。
- 業餘頻段不可假設可任意用於商業或高資料率任務；小衛星使用業餘頻段受到更嚴格期待與協調。

### 5. Operational conflicts / 任務衝突

高資料率通訊常需要：

- 對地面站或中繼星指向。
- 高功耗 PA / transmitter。
- 天線或 laser terminal 熱管理。
- 儲存排程與檔案優先級。

因此通訊視窗可能與成像、太陽能板指向、熱控冷卻、姿態恢復互相衝突。任務規劃器不能只排 payload capture，也要排 downlink。

## ADCS / AOCS Constraints / 姿態控制限制

### 1. 指標要分開，不可只說「可指向」

| 指標 | 意義 | 對任務的影響 |
| --- | --- | --- |
| Pointing knowledge | 衛星知道自己姿態的精度 | 影像 geolocation、SAR Doppler、光通訊 acquisition |
| Pointing control accuracy | 衛星能把 boresight 指到目標的精度 | AOI 是否落在畫面、天線是否對準 |
| Pointing stability / jitter | 曝光或通訊期間 line-of-sight 抖動 | 光學影像模糊、SAR 品質、lasercom link loss |
| Slew rate | 可轉動速度 | 是否趕得上短視窗任務 |
| Settle time | 轉向後穩定所需時間 | 成像前需預留，否則影像會糊 |
| Momentum capacity | reaction wheel 可吸收角動量 | 飽和後需卸載，期間可能不能成像 |

NASA SmallSat GNC state-of-the-art 表列出小衛星常見 ADCS 元件性能：reaction wheel、magnetic torquer、star tracker、sun sensor、earth sensor、gyro、GPS receiver、integrated ADCS 等；其中 integrated units 的 pointing capability 可跨 0.002-5 degree 等級，差距很大，必須看具體衛星。

### 2. Sensors / 姿態感測器限制

| 感測器 | 用途 | 限制 |
| --- | --- | --- |
| Star tracker | 高精度姿態知識 | Sun / Moon / Earth blinding、星場遮蔽、lost-in-space recovery、熱與輻射 |
| Gyro / IMU | 短期角速度與姿態傳遞 | bias drift、角隨機游走、輻射、需校正 |
| Sun sensor | 太陽向量、safe mode | 精度較低，進入 eclipse 不可用 |
| Magnetometer | 地磁向量、B-dot detumble | 受 spacecraft 電流與磁場干擾，只適合 LEO 附近 |
| Earth horizon sensor | 對地姿態粗估 | 精度有限，受地球紅外/視場限制 |
| GNSS receiver | 軌道定位，部分多天線可姿態估測 | LEO 最成熟；高軌訊號弱，且精度/法規限制需確認 |

### 3. Actuators / 姿態致動器限制

| 致動器 | 優點 | 限制 |
| --- | --- | --- |
| Reaction wheel | 精密三軸控制，適合光學/SAR/高增益天線 | 有 momentum saturation、jitter、功耗，需卸載 |
| Magnetic torquer | 簡單、低功耗、可卸載 wheel momentum | 只能對地磁場方向產生力矩，控制 authority 隨軌道位置變化，深空/GEO 不適合主控 |
| Thruster | 可提供大力矩、動量卸載、軌控 | 消耗推進劑、污染風險、熱與安全限制 |
| Gimbal / scan mirror / fine steering mirror | 可減少整星轉動需求 | 增加質量、功耗、控制複雜度與故障點 |

### 4. Payload-specific pointing / 任務對姿態的要求

| 酬載 | 姿態限制 |
| --- | --- |
| VHR optical | 曝光期間 line-of-sight jitter 必須是像素角大小的一小部分；off-nadir 會放大 GSD、陰影與遮蔽；slew 後需 settle |
| Multispectral / hyperspectral | 需穩定掃描與光譜配準；不同 band co-registration 對姿態與熱穩定敏感 |
| SAR | 需控制入射角、方位向 Doppler、天線指向；InSAR 對重複軌道與幾何一致性更敏感 |
| Thermal IR | 需穩定掃描、低雜訊與熱控；太陽、月球、地球邊緣可能影響校正 |
| RF high-gain antenna | 窄波束需地面站或 relay 指向；姿態誤差會造成 link margin 掉落 |
| Optical comm | 通常需要精密三軸控制、star tracker、可能還要 fine steering mirror；雲與 PAT 是硬限制 |

NASA SmallSat communications 文件特別指出，small satellite lasercom 往往需要精密三軸 reaction wheels 與至少一個 star tracker；雲層可能讓 optical downlink 無法進行，因此 RF 通常仍是互補備援。

### 5. Planner rejection rules / 規劃器應拒絕或降級的情況

任務規劃器應把下列狀況判定為不可行、需改期或需人工覆核：

- `required_off_nadir_deg > satellite.max_off_nadir_deg`
- `required_slew_deg / slew_rate + settle_time > access_window_duration`
- `pointing_error_budget > payload_pixel_angle_budget`
- `expected_jitter > max_jitter_for_exposure`
- `wheel_momentum_pct > desaturation_threshold`
- `desaturation_required == true` 且與成像或通訊視窗重疊
- `star_tracker_blinded == true` 且任務需要 fine pointing
- `battery_soc_after_task < reserve_threshold`
- `downlink_required == true` 但沒有可行 downlink / relay path
- 光學任務 `cloud_probability` 或 `solar_elevation` 不合格
- SAR InSAR 任務缺少 repeat geometry、orbit control 或 coherence 條件

## Suggested System Schema / 建議系統欄位

```json
{
  "mission_intent": "wildfire_response | construction_monitoring | maritime_surveillance | land_cover | weather_nowcasting | communications | pnt | science",
  "payload_family": "vhr_optical | multispectral | hyperspectral | thermal_ir | sar | ais | adsb | rf_monitor | comms | pnt | lidar | radar_altimeter",
  "required_gsd_m": 3,
  "resolution_basis": "gsd | sar_resolution | footprint | vertical_precision | not_applicable",
  "orbit_preference": "vleo | leo | sso | meo | geo | heo",
  "cadence": "one_time | hourly | daily | weekly | continuous",
  "latency_requirement": "near_real_time | same_day | routine",
  "environment_constraints": {
    "daylight_required": true,
    "cloud_tolerance": "low | medium | high",
    "weather_tolerance": "optical_sensitive | sar_all_weather | optical_blocked_by_cloud"
  },
  "adcs_constraints": {
    "max_off_nadir_deg": 30,
    "required_slew_deg": 12,
    "settle_time_s": 30,
    "pointing_accuracy_deg": 0.02,
    "jitter_limit_urad": 10
  },
  "communications_constraints": {
    "estimated_product_size_gb": 8,
    "downlink_band": "s | x | ka | optical",
    "requires_ground_contact_before": "2026-05-20T12:00:00Z",
    "minimum_link_margin_db": 3
  },
  "operator_gate": "required"
}
```

## Practical Examples / 實務判斷範例

### Wildfire response / 森林大火

- 若需求是「快速知道火勢與煙羽」：GEO 氣象 + LEO thermal，解析度可較粗但 latency 要低。
- 若需求是「火後燒灼區」：Sentinel/Landsat 級 10-30 m multispectral/SWIR 足夠。
- 若需求是「建物受損、道路是否可通」：0.5-3 m optical；若雲煙遮蔽，改 SAR。
- 系統輸出應同時檢查：雲、煙、日照、熱飽和、最早過境、下傳視窗。

### Construction monitoring / 工地週期監測

- 若只是進度與占地變化：1-3 m optical 通常足夠。
- 若要車輛、材料堆、細節：0.3-1 m。
- 應優先選 SSO 或固定 local solar time，以保持光照一致。
- 每日任務要檢查 constellation coverage，不要假設單顆衛星每天都能同角度拍到。

### Flood mapping / 洪水

- 多雲或颱風後：優先 SAR，5-30 m 即可做大範圍水體。
- 天氣放晴後：multispectral NIR/SWIR 可做水體與泥沙判別。
- 城市細節或堤防損壞：加 VHR optical 或高解析 SAR。

### Maritime surveillance / 海事監控

- 大範圍找船：SAR。
- 身分與軌跡：AIS。
- 細節與違規證據：VHR optical 補拍。
- AIS 不是影像，沒有 GSD；要處理關機、偽造、訊號碰撞與時間差。

## Source Trail / 來源

- NASA Earth Observatory, [Remote Sensing](https://science.nasa.gov/earth/earth-observatory/remote-sensing/): remote sensing、pixels、spatial resolution、multispectral concepts.
- ESA Space Solutions, [Newcomers Earth Observation Guide](https://business.esa.int/newcomers-earth-observation-guide): GSD 定義、panchromatic / multispectral / SAR 類型、resolution 與 swath trade-off.
- ESA, [Sentinel-2 high-resolution and multispectral](https://www.esa.int/ESA_Multimedia/Images/2014/07/Sentinel-2_high-resolution_and_multispectral): Sentinel-2 13 bands、10/20/60 m、290 km swath.
- NASA Science, [Landsat 9](https://science.nasa.gov/mission/landsat-9/): Landsat 9 15 m pan、30 m VSWIR/SWIR、100 m TIR、705 km SSO、185 km swath.
- NASA Earthdata, [Synthetic Aperture Radar](https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar): SAR 原理、band 與應用、解析度與天線/波長關係.
- NASA Science, [NISAR Mission Overview](https://science.nasa.gov/mission/nisar/mission-overview/): NISAR 747 km、L/S band、3-10 m SAR resolution、資料量與任務特性.
- NOAA / NESDIS / STAR, [GOES ABI Spectral Attributes](https://www.star.nesdis.noaa.gov/GOES/abispectralattributes.php): GOES ABI band 與 0.5/1/2 km subpoint pixel spacing.
- NASA Earth Observatory, [Catalog of Earth Satellite Orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/): LEO / MEO / GEO、SSO、GPS orbit、GEO weather / comm 用途.
- NASA Small Spacecraft Systems Virtual Institute, [Communications](https://www.nasa.gov/smallsat-institute/sst-soa/soa-communications/): S/X/Ka、rain fade、lasercom、pointing / PAT、cloud limits.
- NASA Small Spacecraft Systems Virtual Institute, [Ground Data Systems and Mission Operations](https://www.nasa.gov/smallsat-institute/sst-soa/ground-data-systems-and-mission-operations/): link budget、頻段、3 dB margin、licensing、地面站服務.
- NASA Small Spacecraft Systems Virtual Institute, [Guidance, Navigation, and Control](https://www.nasa.gov/smallsat-institute/sst-soa/guidance-navigation-and-control/): ADCS sensors、actuators、state-of-the-art performance、GNSS limits.
- ESA Connectivity and Secure Communications, [Satellite AIS overview](https://connectivity.esa.int/overview-5): SAT-AIS 用於海事監控與 LEO 船舶訊號接收.
- GPS.gov, [GPS Space Segment](https://www.gps.gov/systems/gps/space/): GPS satellite signals、atomic clocks、PNT space segment.
- ESA, [Galileo satellites](https://www.esa.int/Applications/Satellite_navigation/Galileo/Galileo_satellites): Galileo MEO constellation、navigation payload、atomic clocks.
- FAS mirror, [Civil NIIRS Reference Guide](https://irp.fas.org/imint/niirs_c/guide.htm): NIIRS 作為影像可解譯度與任務規格溝通框架.
- NASA NTRS, [Determining True Sensor Spatial Resolution of Very High Resolution Optical Imagery](https://ntrs.nasa.gov/citations/20250001434): 真實 sensor spatial resolution、FWHM、pixel size 與 over/under-sampling.
