<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{ signature: string }>()

const typeLinks: Record<string, string> = {
  ADC_HandleTypeDef: '/Docs/HAL_Docs/ADC#type-adc-handletype-def',
  ADC_InitTypeDef: '/Docs/HAL_Docs/ADC#type-adc-inittype-def',
  ADC_ChannelConfTypeDef: '/Docs/HAL_Docs/ADC#type-adc-channelconftypedef',
  ADC_OversamplingTypeDef: '/Docs/HAL_Docs/ADC#type-adc-oversamplingtypedef',
  ADC_InjectionConfigTypeDef: '/Docs/HAL_Docs/ADC#type-adc-injectionconfigtypedef',
  CAN_HandleTypeDef: '/Docs/HAL_Docs/CAN#type-can-handletype-def',
  CAN_InitTypeDef: '/Docs/HAL_Docs/CAN#type-can-inittype-def',
  CAN_FilterTypeDef: '/Docs/HAL_Docs/CAN#type-can-filtertypedef',
  CAN_TxHeaderTypeDef: '/Docs/HAL_Docs/CAN#type-can-txheadertypedef',
  CAN_RxHeaderTypeDef: '/Docs/HAL_Docs/CAN#type-can-rxheadertypedef',
  DMA_HandleTypeDef: '/Docs/HAL_Docs/DMA#type-dma-handletype-def',
  DMA_InitTypeDef: '/Docs/HAL_Docs/DMA#type-dma-inittype-def',
  FDCAN_HandleTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-handletype-def',
  FDCAN_MsgRamAddressTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-msgramaddresstypedef',
  FDCAN_InitTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-inittype-def',
  FDCAN_FilterTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-filtertypedef',
  FDCAN_TxHeaderTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-txheadertypedef',
  FDCAN_RxHeaderTypeDef: '/Docs/HAL_Docs/FDCAN#type-fdcan-rxheadertypedef',
  FLASH_EraseInitTypeDef: '/Docs/HAL_Docs/Flash#type-flash-eraseinittypedef',
  GPIO_TypeDef: '/Docs/HAL_Docs/GPIO#type-gpio-typedef',
  GPIO_InitTypeDef: '/Docs/HAL_Docs/GPIO#type-gpio-inittype-def',
  I2C_HandleTypeDef: '/Docs/HAL_Docs/I2C#type-i2c-handletype-def',
  I2C_InitTypeDef: '/Docs/HAL_Docs/I2C#type-i2c-inittype-def',
  RCC_OscInitTypeDef: '/Docs/HAL_Docs/RCC#type-rcc-oscinittype-def',
  RCC_PLLInitTypeDef: '/Docs/HAL_Docs/RCC#type-rcc-pllinittype-def',
  RCC_ClkInitTypeDef: '/Docs/HAL_Docs/RCC#type-rcc-clkinittype-def',
  RCC_PeriphCLKInitTypeDef: '/Docs/HAL_Docs/RCC#type-rcc-periphclkinittype-def',
  TIM_HandleTypeDef: '/Docs/HAL_Docs/TIM#type-tim-handletype-def',
  TIM_Base_InitTypeDef: '/Docs/HAL_Docs/TIM#type-tim-base-inittype-def',
  TIM_ClockConfigTypeDef: '/Docs/HAL_Docs/TIM#type-tim-clockconfigtypedef',
  TIM_Encoder_InitTypeDef: '/Docs/HAL_Docs/TIM#type-tim-encoder-inittype-def',
  TIM_MasterConfigTypeDef: '/Docs/HAL_Docs/TIM#type-tim-masterconfigtypedef',
  TIM_OC_InitTypeDef: '/Docs/HAL_Docs/TIM#type-tim-oc-inittype-def',
  UART_HandleTypeDef: '/Docs/HAL_Docs/UART#type-uart-handletype-def',
  UART_InitTypeDef: '/Docs/HAL_Docs/UART#type-uart-inittype-def',
  UART_AdvFeatureInitTypeDef: '/Docs/HAL_Docs/UART#type-uart-advfeatureinittype-def',
  PCD_HandleTypeDef: '/Docs/HAL_Docs/USB_CDC#type-pcd-handletype-def',
  USBD_HandleTypeDef: '/Docs/HAL_Docs/USB_CDC#type-usbd-handletype-def',
}

const parts = computed(() =>
  props.signature
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .split(/([A-Za-z_][A-Za-z0-9_]*)/g)
)
</script>

<template>
  <div class="api-signature" role="group" aria-label="関数の宣言">
    <code><template v-for="(part, index) in parts" :key="index"><a v-if="typeLinks[part]" :href="withBase(typeLinks[part])">{{ part }}</a><template v-else>{{ part }}</template></template></code>
  </div>
</template>
