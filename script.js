document.addEventListener('DOMContentLoaded', function () {
    const calculateBtn = document.getElementById('calculateBtn');
    const popupOverlay = document.getElementById('popupOverlay');
    const quotePopup = document.getElementById('quotePopup');
    const gridConnection = document.getElementById('gridConnection');
    const batteryCapacity = document.getElementById('batteryCapacity');
    const slider = document.getElementById('dayUsageRatio');
    const currentRatio = document.getElementById('currentRatio');

    const batteryOptions = {
        '1phase': [
            { value: '5', text: '5 kWh' },
            { value: '10', text: '10 kWh' },
            { value: '15', text: '15 kWh' },
            { value: '20', text: '20 kWh' },
            { value: '25', text: '25 kWh' }
        ],
        '3phase': [
            { value: '7.5', text: '7.5 kWh' },
            { value: '10', text: '10 kWh' },
            { value: '12.5', text: '12.5 kWh' },
            { value: '15', text: '15 kWh' },
            { value: '17.5', text: '17.5 kWh' },
            { value: '20', text: '20 kWh' },
            { value: '22.5', text: '22.5 kWh' },
            { value: '25', text: '25 kWh' }
        ]
    };

    const provinceYield = {
        'An Giang': 4.1, 'Bà Rịa - Vũng Tàu': 4.3, 'Bạc Liêu': 3.9, 'Bắc Giang': 3.0, 'Bắc Kạn': 2.9,
        'Bắc Ninh': 3.1, 'Bến Tre': 4.1, 'Bình Dương': 4.1, 'Bình Định': 4.0, 'Bình Phước': 4.0,
        'Bình Thuận': 4.1, 'Cà Mau': 3.8, 'Cao Bằng': 2.9, 'Cần Thơ': 3.9, 'Đà Nẵng': 4.1,
        'Đắk Lắk': 4.2, 'Đắk Nông': 4.1, 'Điện Biên': 3.5, 'Đồng Nai': 4.2, 'Đồng Tháp': 4.1,
        'Gia Lai': 4.1, 'Hà Giang': 2.8, 'Hà Nam': 3.0, 'Hà Nội': 3.1, 'Hà Tĩnh': 3.1,
        'Hải Dương': 3.0, 'Hải Phòng': 3.1, 'Hậu Giang': 3.9, 'Hòa Bình': 3.1, 'Hưng Yên': 3.0,
        'Khánh Hòa': 4.3, 'Kiên Giang': 3.9, 'Kon Tum': 4.1, 'Lai Châu': 3.3, 'Lạng Sơn': 2.9,
        'Lào Cai': 2.9, 'Lâm Đồng': 4.3, 'Long An': 4.0, 'Nam Định': 3.0, 'Nghệ An': 3.4,
        'Ninh Bình': 3.2, 'Ninh Thuận': 4.5, 'Phú Thọ': 3.0, 'Phú Yên': 4.0, 'Quảng Bình': 3.1,
        'Quảng Nam': 3.5, 'Quảng Ngãi': 3.7, 'Quảng Ninh': 2.9, 'Quảng Trị': 3.2, 'Sóc Trăng': 4.0,
        'Sơn La': 3.3, 'Tây Ninh': 4.2, 'Thái Bình': 3.0, 'Thái Nguyên': 2.9, 'Thanh Hóa': 3.1,
        'Thừa Thiên Huế': 3.4, 'Tiền Giang': 4.0, 'TP. Hồ Chí Minh': 4.0, 'Trà Vinh': 4.1,
        'Tuyên Quang': 2.9, 'Vĩnh Long': 4.0, 'Vĩnh Phúc': 3.0, 'Yên Bái': 2.8
    };

    const tiers = [
        { limit: 50, rate: 1984 }, { limit: 50, rate: 2050 }, { limit: 100, rate: 2380 },
        { limit: 100, rate: 2998 }, { limit: 100, rate: 3350 }, { limit: Infinity, rate: 3460 }
    ];

    function updateSliderBackground() {
        const value = slider.value;
        const percentage = (value / slider.max) * 100;
        currentRatio.textContent = value + '%';
        slider.style.background = `linear-gradient(to right, #91DC5D ${percentage}%, rgba(255, 255, 255, 0.3) ${percentage}%)`;
    }

    slider.addEventListener('input', updateSliderBackground);
    updateSliderBackground();

    function updateBatteryOptions() {
        const selectedPhase = gridConnection.value;
        batteryCapacity.innerHTML = '<option value="">-- Chọn dung lượng pin --</option>';

        const zeroOption = document.createElement('option');
        zeroOption.value = '0';
        zeroOption.textContent = '0 kWh (Không lưu trữ)';
        batteryCapacity.appendChild(zeroOption);

        if (selectedPhase && batteryOptions[selectedPhase]) {
            batteryOptions[selectedPhase].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                batteryCapacity.appendChild(optionElement);
            });
        }
    }

    gridConnection.addEventListener('change', updateBatteryOptions);
    updateBatteryOptions();

    const scenarioSelect = document.getElementById('scenario');
    const gridConnectionSelect = document.getElementById('gridConnection');
    const phase1Option = gridConnectionSelect.querySelector('option[value="1phase"]');
    const phase3Option = gridConnectionSelect.querySelector('option[value="3phase"]');

    function updatePhaseOptions() {
        const selectedScenario = scenarioSelect.value;
        
        if (selectedScenario === 'production' || selectedScenario === 'commercial') {
            phase1Option.style.display = 'none';
            phase3Option.style.display = 'block';
            
            if (gridConnectionSelect.value === '1phase') {
                gridConnectionSelect.value = '3phase';
                updateBatteryOptions();
            }
        } else {
            phase1Option.style.display = 'block';
            phase3Option.style.display = 'block';
        }
    }

    scenarioSelect.addEventListener('change', updatePhaseOptions);
    updatePhaseOptions();

    function calculateSolarSystem({ type, billVnd, dayRatio, storage, province }) {
        const unVat = billVnd / 1.08;

        let monthlyKwh;
        if (type === 'residential') {
            monthlyKwh = computeTierKwh(unVat, tiers);
        } else if (type === 'production') {
            monthlyKwh = unVat / 2200;
        } else {
            monthlyKwh = unVat / 3500;
        }

        const dailyKwh = monthlyKwh / 30;
        const yieldVal = provinceYield[province] || 0;
        const dayCap = dailyKwh * dayRatio / yieldVal;
        const nightCap = storage / yieldVal;
        const capacityOpt = dayCap + nightCap;

        const annualProduction = capacityOpt * yieldVal * 365;
        const roofArea = capacityOpt * 5;

        let capitalCost, rate;
        if (type === 'residential') {
            if (storage > 0) {
                capitalCost = capacityOpt * 13356000 + (storage * 35200000) / 5;
            } else {
                capitalCost = capacityOpt * 10200000;
            }
            rate = 3000;
        } else if (type === 'production') {
            if (storage > 0) {
                capitalCost = capacityOpt * 13600000 + (storage * 60200000) / 7.68;
            } else {
                capitalCost = capacityOpt * 7500000;
            }
            rate = 2400;
        } else {
            if (storage > 0) {
                capitalCost = capacityOpt * 13600000 + (storage * 60200000) / 7.68;
            } else {
                capitalCost = capacityOpt * 7500000;
            }
            rate = 4000;
        }

        const payback = capitalCost / (annualProduction * rate);

        return { monthlyKwh, capacityOpt, roofArea, annualProduction, capitalCost, payback, storage };
    }

    function computeTierKwh(amount, tiers) {
        let remaining = amount;
        let total = 0;
        for (const { limit, rate } of tiers) {
            const possible = remaining / rate;
            if (possible <= 0) break;
            const used = Math.min(possible, limit);
            total += used;
            remaining -= used * rate;
        }
        return total;
    }

    function displayResults(r) {
        const resultDiv = document.getElementById('resultDiv');
        
        const htmlContent = `
            <div class="result-item">
                <div class="result-label">Công suất hệ thống tối ưu</div>
                <div class="result-value">${r.capacityOpt.toFixed(1)} kWp</div>
            </div>
            ${r.storage > 0 ? `
            <div class="result-item">
                <div class="result-label">Lưu trữ</div>
                <div class="result-value">${r.storage} kWh</div>
            </div>` : ''}
            <div class="result-item">
                <div class="result-label">Sản lượng điện tạo ra trong 1 năm</div>
                <div class="result-value">${r.annualProduction.toFixed(1)} kWh</div>
            </div>
            <div class="result-item">
                <div class="result-label">Diện tích mái</div>
                <div class="result-value">${r.roofArea.toFixed(1)} m²</div>
            </div>
            <div class="result-item">
                <div class="result-label">Thời gian thu hồi vốn</div>
                <div class="result-value">${r.payback.toFixed(1)} năm</div>
            </div>
            <button type="button" class="quote-button" onclick="openQuoteForm()">
                Nhận báo giá chi tiết
            </button>
        `;
        
        resultDiv.innerHTML = htmlContent;
    }

    function validateForm() {
        let isValid = true;
        const requiredFields = ['customerName', 'customerPhone'];

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const formGroup = field.closest('.form-group');

            formGroup.classList.remove('error');

            if (!field.value.trim()) {
                formGroup.classList.add('error');
                isValid = false;
            } else if (fieldId === 'customerPhone') {
                const phoneRegex = /^[0-9]{10,11}$/;
                if (!phoneRegex.test(field.value.replace(/\s/g, ''))) {
                    formGroup.classList.add('error');
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    calculateBtn.addEventListener('click', () => {
        const type = document.getElementById('scenario').value;
        const grid = document.getElementById('gridConnection').value;
        const rawBill = document.getElementById('monthlyPayment').value;
        const dayRatio = parseFloat(document.getElementById('dayUsageRatio').value) / 100;
        const storage = parseFloat(document.getElementById('batteryCapacity').value) || 0;
        const province = document.getElementById('province').value;

        if (!type || !grid || !rawBill || !province) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }
        if (dayRatio < 0 || dayRatio > 1) {
            alert('Tỷ lệ sử dụng ban ngày phải từ 0-100%!');
            return;
        }

        const billVnd = parseFloat(rawBill.replace(/\./g, ''));

        const results = calculateSolarSystem({
            type,
            billVnd,
            phase: grid === '3phase',
            dayRatio,
            storage,
            province
        });

        displayResults(results);
        popupOverlay.classList.add('show');
    });

    document.querySelectorAll('.popup-overlay').forEach(popup => {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.classList.remove('show');
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.popup-overlay.show').forEach(popup => {
                popup.classList.remove('show');
            });
        }
    });

    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm()) {
                return;
            }

            const submitBtn = e.target.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<span class="loading-spinner"></span>Đang gửi...';
            submitBtn.disabled = true;

            const customerName = document.getElementById('customerName').value;
            const customerPhone = document.getElementById('customerPhone').value;

            setTimeout(() => {
                showSuccessMessage(customerName, customerPhone);
                quoteForm.reset();
                quotePopup.classList.remove('show');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    ['customerName', 'customerPhone'].forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function () {
                const formGroup = this.closest('.form-group');
                formGroup.classList.remove('error');

                if (!this.value.trim()) {
                    formGroup.classList.add('error');
                }

                if (fieldId === 'customerPhone' && this.value.trim()) {
                    const phoneRegex = /^[0-9]{10,11}$/;
                    if (!phoneRegex.test(this.value.replace(/\s/g, ''))) {
                        formGroup.classList.add('error');
                    }
                }
            });

            field.addEventListener('input', function () {
                const formGroup = this.closest('.form-group');
                if (formGroup.classList.contains('error') && this.value.trim()) {
                    formGroup.classList.remove('error');
                }
            });
        }
    });

    const monthlyPaymentInput = document.getElementById('monthlyPayment');
    if (monthlyPaymentInput) {
        monthlyPaymentInput.addEventListener('input', function (e) {
            let value = this.value.replace(/\D/g, '');
            if (value) {
                value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                this.value = value;
            } else {
                this.value = '';
            }
        });
    }
});

function openQuoteForm() {
    document.getElementById('popupOverlay').classList.remove('show');
    document.getElementById('quotePopup').classList.add('show');
}

function closePopup(popupId) {
    document.getElementById(popupId).classList.remove('show');
}

function showSuccessMessage(name, phone) {
    const successPopup = document.createElement('div');
    successPopup.className = 'success-notification';
    successPopup.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h3>Gửi yêu cầu thành công!</h3>
            <p>Cảm ơn <strong>${name}</strong>,<br>
            Chúng tôi sẽ liên hệ với bạn qua số <strong>${phone}</strong> trong vòng 24h.</p>
            <button onclick="closeSuccessNotification()" class="success-btn">Đóng</button>
        </div>
    `;
    document.body.appendChild(successPopup);

    setTimeout(() => {
        successPopup.classList.add('show');
    }, 100);
}

function closeSuccessNotification() {
    const notification = document.querySelector('.success-notification');
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}